## 문제

TypeORM 0.3 부터 `Transaction` 데코레이터가 삭제되면서 `EntityManager.transaction`으로 트랜잭션을 처리했는데 다음과 같은 문제가 있었습니다.

- 레포지토리에 `TransactionalEntityManager`를 전달하면서 인터페이스가 커짐
- 서비스 계층에서 트랜잭션 코드를 작성해 비즈니스 로직에 집중이 떨어짐

그래서 Spring의 Transactional 어노테이션 처럼 데코레이터를 만들어 AOP를 적용하고 싶었습니다. 아래는 Transactional 데코레이터를 적용한 서비스 계층의 코드입니다.

```diff
@Injectable()
export class Service implements IService {
  constructor(
    private readonly dataSource: DataSource,
    @Inject(RepositoryToken.ORDER_REPOSITORY)
    private readonly orderRepository: IOrderRepository,
    @Inject(RepositoryToken.RECEIVER_REPOSITORY)
    private readonly receiverRepository: IReceiverRepository,
    @Inject(RepositoryToken.DELIVERY_PERSON_MATCHED_DATE_REPOSITORY)
    private readonly deliveryPersonMatchedDateRepository: IDeliveryPersonMatchedDateRepository,
    private readonly deliveryUrlCreator: DeliveryUrlCreator,
    private readonly smsApi: NaverSmsApi,
  ) {}

  ...
+ @Transactional()  
  async matchDeliveryPersonAtOrder({
    orderId,
    walletAddress,
  }: {
    orderId: number;
    walletAddress: string;
  }) {
-   await this.dataSource.transaction(async (manager) => {
-     await this.orderRepository.updateDeliveryPersonAtOrder(manager, {
+     await this.orderRepository.updateDeliveryPersonAtOrder({
        orderId,
        walletAddress,
      });

-     await this.deliveryPersonMatchedDateRepository.create(manager, orderId);
+     await this.deliveryPersonMatchedDateRepository.create(orderId);

      const receiver = await this.receiverRepository.findPhoneNumberByOrderId(
-       manager,
        orderId,
      );

      const url = this.deliveryUrlCreator.createUrl({ orderId, walletAddress });
      
      // 문자 발송 외부 API
      await this.smsApi.sendDeliveryTrackingMessage(url, receiver.phone);
-   });
  }
}
```

## 해결

NestJS CLS의 기반이 되는 API인 ALS(AsyncLocalStorage)에 대해 정리하고 문제를 해결하겠습니다.

#### ALS(AsyncLocalStorage)

[ALS(AsyncLocalStorage)](https://nodejs.org/api/async_context.html#class-asynclocalstorage)는 Node.js API로 함수에 인수 전달 없이 동일한 로컬 상태를 전파할 수 있습니다. 타 언어의 스레드 로컬과 유사합니다.

`AsyncLocalStorage#run` 내부에 실행된 함수는 같은 저장소에 접근하게 됩니다. 비동기 함수의 실행마다 고유한 저장소를 가지게 됩니다.

> **참고**\
> [NestJS: Async Local Storage](https://docs.nestjs.com/recipes/async-local-storage)\
> [Node.js: AsyncLocalStorage](https://nodejs.org/api/async_context.html#async_context_class_asynclocalstorage)

> **NOTE**\
> [Typeorm Transactional](https://www.npmjs.com/package/typeorm-transactional)을 사용하면 본문에서 다루는 문제를 쉽고 빠르게 해결할 수 있습니다.

### 동작 흐름

React에서는 Props Drilling을 전역 상태 관리 라이브러리로 해결하는 방법이 있습니다. 본문에서는 이와 유사한 방법으로 `TransactionEntityManager`를 관리해 해결합니다.

![트랜잭션 데코레이터 동작 흐름](<transaction decorator work flow.drawio.svg>)

1. 요청이 들어오면 미들웨어에서 cls 컨텍스트에 `EntityManager`를 저장
2. 트랜잭션 데코레이터 호출
   1. 데코레이터에서 cls 컨텍스트에 저장된 `EntityManager`를 가져옴
   2. 가져온 `EntityManager`로 트랜잭션을 열고 트랜잭션 콜백에서 `TransactionEntityManager`를 cls 컨텍스트에 저장
3. 레포지토리에서 트랜잭션 매니저(핼퍼)를 통해 저장된 `TransactionEntityManager`나 `EntityManager`로 DB 작업을 수행합니다.

### 소스코드

#### 미들웨어

NestJS CLS에서 미들웨어로 루트 모듈에 설정합니다.

```ts
const entities = [
  AverageCostEntity,
  ...
  UserEntity,
];

const repositories: Provider[] = [
  {
    provide: RepositoryToken.AVERAGE_COST_REPOSITORY,
    useClass: AverageCostRepository,
  },
  ...
  { provide: RepositoryToken.USER_REPOSITORY, useClass: UserRepository },
];

const clsRootModule = ClsModule.forRootAsync({
  // 1. ClsModule에서 TypeOrm 엔티티 매니저를 주입 받습니다.
  inject: [EntityManager],
  useFactory: (em) => {
    return {
      // 2. 미들웨어로 설정합니다.
      middleware: {
        mount: true,
        setup: (cls) => {
          // 3. cls 컨텍스트에 초기 설정으로 엔티티 매니저를 저장합니다.
          cls.set(ENTITY_MANAGER_KEY, em);
        },
      },
    };
  },
});

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useClass: TypeOrmOption,
    }),
    TypeOrmModule.forFeature(entities),
    ConfigModule.forFeature(typeOrmConfig),
    clsRootModule,
  ],
  providers: [...repositories, TransactionManager],
  exports: [...repositories],
})
export class TypeOrmRepositoryModule {}
```

#### 데코레이터

```ts
export const Transactional = () => {
  return (
    target: object,
    propertyKey: string | symbol,
    descriptor: PropertyDescriptor,
  ) => {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      
      // 1. cls 컨텍스트를 가져옵니다.
      const cls = ClsServiceManager.getClsService();
      validateCls(cls);

      // 2. cls 컨텍스트에서 엔티티 매니저를 가져옵니다.
      const entityManager: EntityManager = cls.get(ENTITY_MANAGER_KEY);

      validateEntityManager(entityManager);

      // 3. cls 컨텍스트에서 가져온 엔티티 매니저로 트랜잭션을 엽니다.
      return await entityManager.transaction(
        async (transactionEntityManager) => {
          // 4. 트랜잭션 엔티티 매니저를 cls 컨텍스트에 엔티티 매니저로 저장합니다.
          cls.set(ENTITY_MANAGER_KEY, transactionEntityManager);

          // 5. 원본 메서드를 실행합니다.
          return await originalMethod.apply(this, args);
        },
      );
    };
  };
};

const validateEntityManager = (entityManager: EntityManager) => {
  if (!entityManager) {
    throw new InternalServerErrorException(
      ClsErrorMessage.NOT_FOUND_ENTITY_MANAGER,
    );
  }
};

const validateCls = (cls: ClsService<ClsStore>) => {
  if (!cls.isActive()) {
    throw new InternalServerErrorException(ClsErrorMessage.CLS_NOT_ACTIVE);
  }
};
```

#### 서비스

트랜잭션 데코레이터를 적용한 메서드입니다.

```ts
@Injectable()
export class OrderDeliveryPersonService implements IOrderDeliveryPersonService {
  constructor(
    @Inject(RepositoryToken.ORDER_REPOSITORY)
    private readonly orderRepository: IOrderRepository,
    @Inject(RepositoryToken.RECEIVER_REPOSITORY)
    private readonly receiverRepository: IReceiverRepository,
    @Inject(RepositoryToken.DELIVERY_PERSON_MATCHED_DATE_REPOSITORY)
    private readonly deliveryPersonMatchedDateRepository: IDeliveryPersonMatchedDateRepository,
    @Inject(RepositoryToken.CURRENT_DELIVERY_LOCATION_REPOSITORY)
    private readonly currentDeliveryLocationRepository: ICurrentDeliveryLocationRepository,
    private readonly deliveryUrlCreator: DeliveryUrlCreator,
    private readonly smsApi: NaverSmsApi,
  ) {}

  ...

  @Transactional()
  async matchDeliveryPersonAtOrder({
    orderId,
    walletAddress,
  }: {
    orderId: number;
    walletAddress: string;
  }) {
    await this.orderRepository.updateDeliveryPersonAtOrder({
      orderId,
      walletAddress,
    });

    await this.deliveryPersonMatchedDateRepository.create(orderId);

    const receiver =
      await this.receiverRepository.findPhoneNumberByOrderId(orderId);

    const url = this.deliveryUrlCreator.createUrl({ orderId, walletAddress });

    await this.smsApi.sendDeliveryTrackingMessage(url, receiver.phone);
  }
}
```

#### 레포지토리

##### OrderRepository.ts

```ts
@Injectable()
export class OrderRepository
  extends AbstractRepository<OrderEntity>
  implements IOrderRepository
{
  // 1. transactionManager는 cls 컨텍스트에서 엔티티를 가져오는 핼퍼입니다.
  constructor(protected readonly transactionManager: TransactionManager) {
    super(OrderEntity);
  }

  async updateDeliveryPersonAtOrder({
    orderId,
    walletAddress,
  }: {
    orderId: number;
    walletAddress: string;
  }) {
    try {
      // 2. this.getManager()는 AbstractRepository에서 상속받은 메서드로 cls 컨텍스트에서 엔티티 매니저를 가지고 옵니다.
      const deliverPerson = await this.getManager().findOneBy(UserEntity, {
        walletAddress,
      });

      this.validateNotNull(walletAddress, deliverPerson);

      const order = await this.getManager().findOne(OrderEntity, {
        relations: { requester: true },
        select: {
          requester: { walletAddress: true },
        },
        where: { id: orderId },
      });

      this.validateNotNull(walletAddress, order);

      if (deliverPerson.walletAddress === order.requester.walletAddress) {
        throw new BusinessRuleConflictDataException(walletAddress);
      }

      await this.getManager().update(
        OrderEntity,
        { id: orderId },
        { deliveryPerson: deliverPerson },
      );
    } catch (error) {
      if (error instanceof NotExistDataException) {
        throw error;
      } else if (error instanceof BusinessRuleConflictDataException) {
        throw error;
      }
      throw new UnknownDataBaseException(error);
    }
  }
  ...
}
```

##### AbstractRepository.ts

```ts
export abstract class AbstractRepository<T> {
  // 1. AbstractRepository를 상속받는 커스텀 레포지토리는 TransactionManager를 주입 받도록 설정합니다.
  protected abstract readonly transactionManager: TransactionManager;
  
  constructor(protected readonly entity: EntityTarget<T>) {}

  // 2. TransactionManager에서 엔티티 매니저를 가져옵니다. TransactionManager는 다음 코드 블록에서 후술합니다.
  protected getManager() {
    return this.transactionManager.getManager();
  }

  // 3. TransactionManager에서 가져온 엔티티 매니저로 레포지토리를 가져옵니다.
  protected getRepository() {
    return this.getManager().getRepository(this.entity);
  }
}
```

#### 트랜잭션 매니저

```ts
@Injectable()
export class TransactionManager {
  public getManager() {
    // 1. cls 컨텍스트에 접근합니다.
    const cls = ClsServiceManager.getClsService();

    // 2. 엔티티 매니저를 가져오고 존재하는지 확인합니다.
    const entityManager: EntityManager = cls.get(ENTITY_MANAGER_KEY);

    this.validateEntityManager(entityManager);

    // 3. 엔티티 매니저를 반환합니다.
    return entityManager;
  }

  private validateEntityManager(entityManager: EntityManager) {
    if (!entityManager) {
      throw new InternalServerErrorException(
        ClsErrorMessage.NOT_FOUND_ENTITY_MANAGER,
      );
    }
  }
}
```

### 성과

- 레포지토리 메서드에 넘기는 인자를 줄여 인터페이스가 축소됨
- 서비스 계층에서 비즈니스 로직에 더 집중할 수 있음

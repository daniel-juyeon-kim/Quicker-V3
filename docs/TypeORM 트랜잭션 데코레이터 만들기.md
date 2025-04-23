## 문제

TypeORM을 이용하여 트랜잭션을 수행하려면 `DataSource`나 `EntityManager`로 트랜잭션 콜백함수나 QueryRunner로 코드를 감싸야합니다. 이러한 방식은 아래와 같은 문제점이 있습니다.

- React의 Props Drilling처럼 트랜잭션과 관련된 함수에 인수로 `DataSource`, `EntityManager`를 전달해야합니다.
- 서비스 계층 메서드에서 트랜잭션 관련 코드를 작성해야합니다.(서비스 자체에 집중이 떨어집니다.)

Spring에서는 Transactional 어노테이션으로 AOP를 할 수 있습니다. Transactional 데코레이터로 공통 관심사를 추출하면 아래와 같은 장점이 있습니다.

- 레포지토리 메서드에 넘기는 인자를 줄일 수 있다.
- 서비스 계층 메서드 내부에서 직접 트랜잭션 코드를 작성하지 않는다.
- AOP가 가능하다.

아래는 Transactional데코레이터를 적용한 서비스 계층으로 이번 글의 목표입니다.

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
      
      // 외부 API
      await this.smsApi.sendDeliveryTrackingMessage(url, receiver.phone);
-   });
  }
}
```

## 해결

NestJS CLS 라이브러리의 뿌리가 되는 기능인 ALS(AsyncLocalStorage)에 대해 정리하고 NestJS CLS를 이용해 문제를 해결하겠습니다.

> **NOTE:**\
> [Typeorm Transactional](https://www.npmjs.com/package/typeorm-transactional)을 사용하면 본문에서 다루는 문제를 해결할 수 있습니다. 학습의 목적도 있으므로 본문에서는 NestJS CLS를 이용하겠습니다.

#### ALS(AsyncLocalStorage)

[ALS(AsyncLocalStorage)](https://nodejs.org/api/async_context.html#class-asynclocalstorage)는 Node.js API로 함수에 인수 전달 없이 동일한 로컬 상태를 전파할 수 있습니다. 타 언어의 스레드 로컬과 유사합니다.

`AsyncLocalStorage#run` 내부에 실행된 함수는 같은 저장소에 접근하게 됩니다. 비동기 함수의 실행마다 고유한 저장소를 가지게 됩니다.

이걸 활용하면 요청마다 트랜잭션 매니저를 별도로 저장하고 불러올 수 있습니다.

> - [nestjs: async-local-storage](https://docs.nestjs.com/recipes/async-local-storage)
> - [nodejs: async_context_class_asynclocalstorage](https://nodejs.org/api/async_context.html#async_context_class_asynclocalstorage)

### 동작 흐름

아이디어는 React에서 Props Drilling의 문제를 해결하기 위한 전역 상태 관리 라이브러리(Redux, Zustand)와 유사합니다. 필요할 때 전역 공간에 있는 데이터를 읽거나 저장합니다.

![트랜잭션 데코레이터 동작 흐름](<transaction decorator work flow.drawio.svg>)

1. 요청이 들어오면 미들웨어나 인터셉터에서 cls 컨텍스트에 `EntityManager`를 저장합니다.
2. 트랜잭션 데코레이터 호출
   1. 데코레이터에서 cls 컨텍스트에 저장된 `EntityManager`를 가져옵니다.
   2. 가져온 `EntityManager`로 트랜잭션을 엽니다. 트랜잭션 `EntityManager`를 cls 컨텍스트에 저장합니다.
3. 레포지토리에서는 트랜잭션 매니저(cls 컨텍스트에서 `EntityManager`를 가지고 오는 헬퍼 클래스)를 통해 `EntityManager`를 가져와 모든 DB 작업을 수행합니다.

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

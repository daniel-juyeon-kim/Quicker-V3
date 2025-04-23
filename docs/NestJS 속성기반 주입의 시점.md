<!-- nest 모듈의 프로바이더 순서에 따른 DI, 모듈에 프로바이더 순서에 따라 생성자함수에서 조회가 될 수 있고 안될 수 있음
@Inject, @InjectRepository에 따라 주입되는 방식 -->

## 문제

기존 프로젝트에서 트랜젝션과 관련된 부분을 Spring의 Transactional어노테이션처럼 데코레이터로 만들어 공통 관심사로 분리하려고 했습니다.

트랜젝션 처리에 공통으로 필요한 `EntityManager`를 추상 레포지토리의 속성으로 만들고 주입하려고 했습니다. 테스트는 통과했지만 생성자 함수에서 의존성이 제대로 주입되지 않았습니다.(`EntityManager`가 undefined인 상태) 꺼림칙해서 좀 더 확인해 보겠습니다.

### 코드

#### 추상 레포지토리

```ts
export abstract class AbstractRepository {
  @Inject(EntityManager)
  protected readonly manager: EntityManager;

  ...
}

...

@Injectable()
export class AverageCostRepository extends AbstractRepository {
  constructor(
    @InjectRepository(AverageCost)
    private readonly repository: Repository<AverageCost>,
  ) {
    super();
    console.log(this);
    console.log(this.manager);
  }

  ...
}
```

#### 테스트 코드

```ts
describe('AverageCostRepository', () => {
  let testModule: TestingModule;
  let repository: AverageCostRepository;
  let ormRepository: Repository<AverageCost>;

  beforeAll(async () => {
    testModule = await Test.createTestingModule({
      imports: [TestTypeormModule, TypeOrmModule.forFeature([AverageCost])],
      providers: [AverageCostRepository],
    }).compile();

    const manager = testModule.get(EntityManager);
    console.log('EntityManager 클래스', manager);

    ormRepository = testModule.get(getRepositoryToken(AverageCost));
    console.log('TypeORM repository 클래스', ormRepository);

    repository = testModule.get(AverageCostRepository);
    console.log('AverageCostRepository 클래스', repository);
  });
});
```

#### 로그

```txt
// AverageCostRepository의 생성자 함수 console.log(this)

console.log
  AverageCostRepository {
    repository: Repository {
      ...
    }
    // manager 없음
  }

// AverageCostRepository의 생성자 함수 this.manager

console.log
  undefined

// 모듈 컴파일 이후

console.log
  EntityManager 클래스 <ref *1> EntityManager {
    ...
  }

console.log
  TypeORM repository 클래스 <ref *1> Repository {
    ...
  }

console.log
  AverageCostRepository 클래스 AverageCostRepository {
    repository: Repository {
      ...
    },
    manager: <ref *1> EntityManager {
      ...
    }
  }
```

## 추측

Transactional 데코레이터에서는 트랜젝션을 실행할 `EntityManager`가 인스턴스에 존재하지 않으면 에러를 던집니다. 그래서 `EntityManager`가 없으면 테스트는 통과하지 못합니다.

생성자 함수에서 `@InjectRepository`로 주입한 의존성은 제대로 동작하지만 `@Inject`로 주입한 의존성은 인스턴스 생성 시점에 주입되지 않고 컴파일 이후 주입이 되어있습니다.

즉 속성 기반 주입은 인스턴스 생성 후 NestJS가 의존성을 주입합니다.

<!-- 기존에 생성자 주입을 통해 의존성을 주입받는 AverageCostRepository.repository를 속성기반 주입으로 변경하면 인스턴스 생성 시점에 속성이 아무것도 존재하지 않습니다. -->

### 결론

- 생성자 기반 주입은 인스턴스 생성 시점에 NestJS가 의존성 주입(생성자 함수에서 확인 가능)
- 속성 기반 주입은 인스턴스 생성 후 NestJS가 의존성 주입(생성자 함수에서 확인 불가능)

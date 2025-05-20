## Quicker V3

[Quicker V2](https://github.com/daniel-juyeon-kim/Quicker-V2)를 NestJS로 마이그레이션 한 프로젝트입니다. 의존성 주입 관리가 복잡해지는 문제를 Nest IoC 컨테이너를 이용해 간소화 하고 트랜잭션 코드를 데코레이터로 분리해 AOP를 적용했습니다.

### Transactional 데코레이터를 구현하여 AOP적용 [더보기](<docs/TypeORM 트랜잭션 데코레이터 만들기.md>)

#### [문제]

TypeORM 0.3 부터 `Transaction` 데코레이터가 삭제되서 `EntityManager.transaction`으로 트랜잭션을 했고 다음과 같은 문제가 있었습니다.

- 레포지토리에 `TransactionalEntityManager`를 전달하면서 인터페이스가 커짐
- 서비스 계층 메서드 내부에서 트랜잭션 코드를 작성해 비즈니스 로직에 집중이 떨어짐

#### [해결]

트랜잭션 코드를 Transactional 데코레이터로 추출해 AOP를 적용했습니다. NestJS CLS로 요청마다 [독립된 컨텍스트에 `EntityManager`를 두고 핼퍼로 접근](<docs/TypeORM 트랜잭션 데코레이터 만들기.md#동작-흐름>)해 DB 작업을 합니다. 다음과 같은 이점이 있습니다.

- 레포지토리 인터페이스 축소
- 서비스 계층에서 비즈니스 로직에 더 집중할 수 있음

#### 사용 기술

**Back:** TypeScript, NestJS, TypeORM, Mongoose, SlackAPI, Naver SMS API\
**DB:** MariaDB, MongoDB\
**Compute:** AWS EC2\
**Tool:** Git, Slack, Swagger, Jest

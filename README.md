## Quicker NestJS

기존 Express 프로젝트를 NestJS로 마이그레이션 한 프로젝트입니다. 개발자가 직접 의존성 주입을 하면서 복잡해진 코드를 Nest IoC 컨테이너로 간소화했습니다. 트랜잭션 코드를 데코레이터로 분리해 가독성과 유지 보수성을 향상시켰습니다.

### [Transactional 데코레이터로 AOP 구현](<docs/TypeORM 트랜잭션 데코레이터 만들기.md>)

#### [문제]

TypeORM의 트랜잭션 코드가 비즈니스 로직을 감싸면서 다음과 같은 문제가 있습니다.

- 트랜잭션을 수행할 메서드에 EntityManager를 인수로 전달 해야 함
- 서비스 계층 메서드 내부에서 트랜잭션 코드를 직접 작성해야 함 (서비스 자체에 집중이 떨어짐)

#### [해결]

Transactional 데코레이터를 만들어 AOP를 적용했습니다. NestJS CLS로 요청마다 독립된 컨텍스트에 `EntityManager`를 관리하고 핼퍼를 통해 이 컨텍스트에 접근해 DB 작업을 합니다. 다음과 같은 이점이 있었습니다.

- 레포지토리 메서드에 넘기는 인자를 줄일 수 있음
- 서비스 계층 메서드 내부에서 직접 트랜잭션 코드를 제어하지 않음

#### 사용 기술

**Back:** TypeScript, NestJS, TypeORM, Mongoose, SlackAPI, Naver SMS API\
**DB:** MariaDB, MongoDB\
**Compute:** AWS EC2\
**Tool:** Git, Slack, Swagger, Jest

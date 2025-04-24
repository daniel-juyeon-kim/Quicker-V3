## Quicker NestJS

기존 Express 프로젝트를 NestJS로 마이그레이션 한 프로젝트입니다. 수작업으로 의존성을 관리하던 것을 Nest IoC 컨테이너로 대체해 개발자가 쉽게 의존성을 관리할 수 있도록 했으며, 트랜잭션 처리를 데코레이터로 분리해 코드의 가독성과 유지보수, AOP가 가능하게 했습니다.

### Transactional 데코레이터로 AOP 구현

#### [문제]

TypeORM에서 제공하는 트랜잭션 기능은 콜백함수나 QueryRunner 코드로 감싸야 합니다. 이러한 방식은 아래와 같은 문제점이 있습니다.

- 트랜잭션을 수행할 메서드에 EntityManager를 인수로 전달 해야 함
- 서비스 계층 메서드 내부에서 트랜잭션 코드를 직접 작성해야 함 (서비스 자체에 집중이 떨어짐)

#### [해결]

NestJS CLS를 이용하여 요청마다 독립된 컨텍스트에 엔티티 매니저를 관리하고 [트랜잭션을 데코레이터로 추출해 AOP를 했습니다.](https://github.com/daniel-juyeon-kim/nestjs-quicker/blob/main/docs/TypeORM%20트랜잭션%20데코레이터%20만들기.md) 아래와 같은 이점을 얻었습니다.

- 레포지토리 메서드에 넘기는 인자를 줄일 수 있음
- 서비스 계층 메서드 내부에서 직접 트랜잭션 코드를 제어하지 않음
- AOP 가능

#### 사용 기술

**Back:** TypeScript, NestJS, TypeORM, Mongoose, SlackAPI, Naver SMS API\
**DB:** MariaDB, MongoDB\
**Compute:** AWS EC2\
**Tool:** Git, Slack, Swagger, Jest

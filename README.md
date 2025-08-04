## Quicker V3

[Quicker V2](https://github.com/daniel-juyeon-kim/Quicker-V2)를 NestJS로 마이그레이션 한 프로젝트로 Nest IoC 컨테이너를 통한 의존성 주입 관리, Transactional 데코레이터 구현, 쿼리튜닝을 했습니다.

### Transactional 데코레이터를 구현하여 AOP적용 [더보기](<docs/TypeORM 트랜잭션 데코레이터 만들기.md>)

#### [문제]

TypeORM 0.3 부터 `Transaction` 데코레이터가 삭제되서 `EntityManager.transaction`으로 트랜잭션을 했습니다. 다음과 같은 문제가 있었습니다.

- 레포지토리에 `TransactionalEntityManager`를 전달하면서 **인터페이스가 커짐**
- 서비스 계층 메서드 내부에서 트랜잭션 코드를 작성해 **비즈니스 로직에 집중이 떨어짐**

#### [해결]

**트랜잭션 코드를 Transactional 데코레이터로 추출해 AOP를 적용**했습니다. NestJS CLS로 요청마다 [독립된 컨텍스트에 `EntityManager`를 두고 핼퍼로 접근](<docs/TypeORM 트랜잭션 데코레이터 만들기.md#동작-흐름>)해 DB 작업을 합니다. 다음과 같은 이점이 있습니다.

- 레포지토리 **인터페이스 축소**
- 서비스 계층에서 비즈니스 로직에 더 집중할 수 있음

### 1차 쿼리튜닝: 불필요한 join 제거 [더보기](<docs/불필요한 join 제거.md>)

#### [문제]

아래의 환경과 연동한 레포지토리 메서드는 레이턴시가 **333437ms로 길었습니다.**

- AWS RDS db.t4g.micro (MySQL Community)
- 100만 order 레코드(10%는 매칭 X)
- 2만 user 레코드(1인당 평균 의뢰 50개)

#### [해결]

로그와 `EXPLAIN ANALYZE`를 통해 [의도치 않게 발생한 join을 확인하고](<docs/불필요한 join 제거.md#해결>), [수정해](<docs/불필요한 join 제거.md#코드-1>) 레이턴시를 **333437ms → 37257ms로 88.8% 단축**했습니다.

### 2차 쿼리튜닝: 페이지네이션 [더보기](<docs/페이지네이션 적용.md>)

#### [문제]

1차 쿼리 튜닝으로 레이턴시를 단축했지만, 로깅 및 외부API를 함께 수행하기에 37257ms는 여전히 길어 **100ms 이하로 추가 개선이 필요했습니다.**

#### [해결]

아래 방법의 장단점을 비교한 결과, 페이지네이션이 가장 적합하다고 판단했습니다.

역정규화

- 장점: **join최소화** 가능
- 단점: `order` 테이블 구조 변경으로 관련 코드 전면 수정 → **일의 규모가 너무 큼**

멀티 컬럼 인덱스

- 단점: 조건절이 `and`, `is null`, `!=` 연산이 있어 장점 없음

페이지네이션

- 장점: **I/O가 적어** 빠르고 `plainToInstance`의 **객체 변환 시간 단축** 가능
- 단점: **API 요청 증가**

[limit, offset으로 조회 건수를 10만 → 20으로 줄이고](<docs/페이지네이션 적용.md#1차-코드>) [서브쿼리로 통신 횟수를 줄여](<docs/페이지네이션 적용.md#2차-코드>), 레이턴시를 **37257ms → 74ms로 단축**했습니다.

#### 사용 기술

**Back:** TypeScript, NestJS, TypeORM, Mongoose, SlackAPI, Naver SMS API\
**DB:** MariaDB, MongoDB\
**Compute:** AWS RDS\
**Tool:** Git, Slack, Swagger, Jest

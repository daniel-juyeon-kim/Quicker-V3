## 문제

아래의 환경과 연동한 주문(배송원이 수락 가능한 주문) 조회의 레이턴시가 **333437ms**로 오래 걸렸습니다.

**DB 환경**

- AWS RDS db.t4g.micro (MySQL Community)
- 100만 order 레코드(90%는 배송원 매칭됨, 즉 조회 대상은 10만 order 레코드)
- 2만 user 레코드(1인 당 평균 50개 주문)

**ERD**

![ERD](./quicker.jpeg)

> **비즈니스 요구사항**
>
> - 자신이 올린 주문은 조회 안됨
> - 이미 매칭된 주문은 조회 안됨

### 코드

가독성을 위해 본문의 모든 소요시간 출력 코드를 삭제했습니다.

```ts
@Injectable()
export class OrderRepository
  extends AbstractRepository<OrderEntity>
  implements IOrderRepository
{
  constructor(protected readonly transactionManager: TransactionManager) {
    super(OrderEntity);
  }

  // 중략

  @Transactional()
  async findAllMatchableOrderByWalletAddress(
    deliverPersonWalletAddress: string,
  ) {
    try {
      const isExistUser = await this.getManager().exists(UserEntity, {
        where: { walletAddress: deliverPersonWalletAddress },
      });

      if (!isExistUser) {
        throw new NotExistDataException(deliverPersonWalletAddress);
      }

      const matchableOrders = await this.getManager().find(OrderEntity, {
        relations: {
          product: true,
          transportation: true,
          destination: true,
          departure: true,
        },
        where: {
          requester: { walletAddress: Not(deliverPersonWalletAddress) },
          deliveryPerson: { walletAddress: IsNull() },
        },
        select: {
          id: true,
          detail: true,
          product: {
            width: true,
            length: true,
            height: true,
            weight: true,
          },
          transportation: {
            walking: true,
            bicycle: true,
            scooter: true,
            bike: true,
            car: true,
            truck: true,
          },
          destination: {
            x: true,
            y: true,
            detail: true,
          },
          departure: {
            x: true,
            y: true,
            detail: true,
          },
        },
      });

      return plainToInstance(MatchableOrderDto, matchableOrders);
    } catch (error) {
      if (error instanceof NotExistDataException) {
        throw error;
      }
      throw new UnknownDataBaseException(error);
    }
  }

  // 중략
  
}
```

### 테스트 코드

```ts
describe('OrderRepository', () => {
  
  // 중략

  describe('findAllMatchableOrderByWalletAddress', () => {
    test('통과하는 테스트, 배송원이 수락한 주문과 생성한 주문은 조회되지 않음', async () => {
      const DELIVERY_PERSON_2_WALLET_ADDRESS =
        '0x26d3d7cd73cd63e07feb92eaa9803aebbf9e6fd8';
      await cls.run(async () => {
        cls.set(ENTITY_MANAGER_KEY, manager);
        const start = Date.now();
        await repository.findAllMatchableOrderByWalletAddress(
          DELIVERY_PERSON_2_WALLET_ADDRESS,
        );
        console.log(`메서드 소요 시간: ${Date.now() - start} ms`);
      });
    }, 10000000);
  });

  // 중략

});
```

### 로그

```log
  // 중략

  console.log
    query: START TRANSACTION

      at Function.logInfo (node_modules/src/platform/PlatformTools.ts:235:17)

  console.log
    query: SELECT 1 AS `row_exists` FROM (SELECT 1 AS dummy_column) `dummy_table` WHERE EXISTS (SELECT 1 FROM `user` `UserEntity` WHERE ((`UserEntity`.`walletAddress` = ?))) LIMIT 1 -- PARAMETERS: ["0x26d3d7cd73cd63e07feb92eaa9803aebbf9e6fd8"]

      at Function.logInfo (node_modules/src/platform/PlatformTools.ts:235:17)

  console.log
    사용자 조회 소요시간: 57ms

      at OrderRepository.findAllMatchableOrderByWalletAddress (src/database/type-orm/repository/order/order.repository.ts:178:15)

  console.log
    query: SELECT `OrderEntity`.`id` AS `OrderEntity_id`, `OrderEntity`.`detail` AS `OrderEntity_detail`, `OrderEntity__OrderEntity_product`.`width` AS    `OrderEntity__OrderEntity_product_width`, `OrderEntity__OrderEntity_product`.`length` AS `OrderEntity__OrderEntity_product_length`,     `OrderEntity__OrderEntity_product`.`height` AS `OrderEntity__OrderEntity_product_height`, `OrderEntity__OrderEntity_product`.`weight` AS `OrderEntity__OrderEntity_product_weight`, `OrderEntity__OrderEntity_product`.`id` AS `OrderEntity__OrderEntity_product_id`, `OrderEntity__OrderEntity_transportation`.`walking` AS `OrderEntity__OrderEntity_transportation_walking`, `OrderEntity__OrderEntity_transportation`.`bicycle` AS     `OrderEntity__OrderEntity_transportation_bicycle`, `OrderEntity__OrderEntity_transportation`.`scooter` AS `OrderEntity__OrderEntity_transportation_scooter`, `OrderEntity__OrderEntity_transportation`.`bike` AS `OrderEntity__OrderEntity_transportation_bike`, `OrderEntity__OrderEntity_transportation`.`car` AS `OrderEntity__OrderEntity_transportation_car`, `OrderEntity__OrderEntity_transportation`.`truck` AS `OrderEntity__OrderEntity_transportation_truck`,     `OrderEntity__OrderEntity_transportation`.`id` AS `OrderEntity__OrderEntity_transportation_id`, `OrderEntity__OrderEntity_destination`.`x` AS     `OrderEntity__OrderEntity_destination_x`, `OrderEntity__OrderEntity_destination`.`y` AS `OrderEntity__OrderEntity_destination_y`,     `OrderEntity__OrderEntity_destination`.`detail` AS `OrderEntity__OrderEntity_destination_detail`, `OrderEntity__OrderEntity_destination`.`id` AS     `OrderEntity__OrderEntity_destination_id`, `OrderEntity__OrderEntity_departure`.`x` AS `OrderEntity__OrderEntity_departure_x`, `OrderEntity__OrderEntity_departure`.`y` AS `OrderEntity__OrderEntity_departure_y`, `OrderEntity__OrderEntity_departure`.`detail` AS `OrderEntity__OrderEntity_departure_detail`, `OrderEntity__OrderEntity_departure`.`id` AS `OrderEntity__OrderEntity_departure_id` 
    FROM `order` `OrderEntity` LEFT JOIN `product` `OrderEntity__OrderEntity_product` ON `OrderEntity__OrderEntity_product`.`id`=`OrderEntity`.`id` LEFT JOIN `transportation` `OrderEntity__OrderEntity_transportation` ON `OrderEntity__OrderEntity_transportation`.`id`=`OrderEntity`.`id` LEFT JOIN `destination` `OrderEntity__OrderEntity_destination` ON `OrderEntity__OrderEntity_destination`.`id`=`OrderEntity`.`id` LEFT JOIN `departure` `OrderEntity__OrderEntity_departure` ON `OrderEntity__OrderEntity_departure`.`id`=`OrderEntity`.`id` LEFT JOIN `user` `OrderEntity__OrderEntity_requester` ON `OrderEntity__OrderEntity_requester`.`id`=`OrderEntity`.`requesterId` LEFT JOIN `user` `OrderEntity__OrderEntity_deliveryPerson` ON `OrderEntity__OrderEntity_deliveryPerson`.`id`=`OrderEntity`.`deliveryPersonId`
    WHERE ((((`OrderEntity__OrderEntity_requester`.`walletAddress` != ?))) AND (((`OrderEntity__OrderEntity_deliveryPerson`.`walletAddress` IS NULL)))) 
    -- PARAMETERS: ["0x26d3d7cd73cd63e07feb92eaa9803aebbf9e6fd8"]

      at Function.logInfo (node_modules/src/platform/PlatformTools.ts:235:17)

  console.log
    주문 조회 소요시간: 327850ms

      at OrderRepository.findAllMatchableOrderByWalletAddress (src/database/type-orm/repository/order/order.repository.ts:222:15)

  console.log
    클래스 객체 변환 소요시간: 5416ms

      at OrderRepository.findAllMatchableOrderByWalletAddress (src/database/type-orm/repository/order/order.repository.ts:231:15)

  console.log
    query: COMMIT

      at Function.logInfo (node_modules/src/platform/PlatformTools.ts:235:17)

  console.log
    메서드 소요 시간: 333437ms

      at order1.repository.test.ts:151:17
  
  // 중략
```

### explain

```log
id|select_type|table                                  |partitions|type  |possible_keys                 |key                           |key_len|ref                                          |rows |filtered|Extra                  |
--+-----------+---------------------------------------+----------+------+------------------------------+------------------------------+-------+---------------------------------------------+-----+--------+-----------------------+
 1|SIMPLE     |OrderEntity__OrderEntity_requester     |          |ALL   |PRIMARY                       |                              |       |                                             |17812|    90.0|Using where            |
 1|SIMPLE     |OrderEntity                            |          |ref   |FK_655a9bfe2ec449a8febb68c4136|FK_655a9bfe2ec449a8febb68c4136|1022   |quicker.OrderEntity__OrderEntity_requester.id|   47|   100.0|                       |
 1|SIMPLE     |OrderEntity__OrderEntity_deliveryPerson|          |eq_ref|PRIMARY                       |PRIMARY                       |1022   |quicker.OrderEntity.deliveryPersonId         |    1|    10.0|Using where; Not exists|
 1|SIMPLE     |OrderEntity__OrderEntity_product       |          |eq_ref|PRIMARY                       |PRIMARY                       |4      |quicker.OrderEntity.id                       |    1|   100.0|                       |
 1|SIMPLE     |OrderEntity__OrderEntity_transportation|          |eq_ref|PRIMARY                       |PRIMARY                       |4      |quicker.OrderEntity.id                       |    1|   100.0|                       |
 1|SIMPLE     |OrderEntity__OrderEntity_destination   |          |eq_ref|PRIMARY                       |PRIMARY                       |4      |quicker.OrderEntity.id                       |    1|   100.0|                       |
 1|SIMPLE     |OrderEntity__OrderEntity_departure     |          |eq_ref|PRIMARY                       |PRIMARY                       |4      |quicker.OrderEntity.id                       |    1|   100.0|                       |
```

### explain analyze

```log
-> Nested loop left join  (cost=2.35e+6 rows=755152) (actual time=39.7..321896 rows=100134 loops=1)
    -> Nested loop left join  (cost=2.21e+6 rows=755152) (actual time=38.4..267564 rows=100134 loops=1)
        -> Nested loop left join  (cost=2.07e+6 rows=755152) (actual time=35.5..212924 rows=100134 loops=1)
            -> Nested loop left join  (cost=1.95e+6 rows=755152) (actual time=35.5..183327 rows=100134 loops=1)
                -> Filter: (OrderEntity__OrderEntity_deliveryPerson.walletAddress is null)  (cost=1.81e+6 rows=755152) (actual time=34.1..141436 rows=100134 loops=1)
                    -> Nested loop antijoin  (cost=1.81e+6 rows=755152) (actual time=34.1..140485 rows=100134 loops=1)
                        -> Nested loop inner join  (cost=480108 rows=755152) (actual time=16.8..128546 rows=999951 loops=1)
                            -> Filter: ((OrderEntity__OrderEntity_requester.walletAddress <> '0x26d3d7cd73cd63e07feb92eaa9803aebbf9e6fd8') and (OrderEntity__OrderEntity_requester.id is not null))  (cost=2052 rows=16031) (actual time=12.3..5860 rows=19999 loops=1)
                                -> Table scan on OrderEntity__OrderEntity_requester  (cost=2052 rows=17812) (actual time=12.3..567 rows=20000 loops=1)
                            -> Index lookup on OrderEntity using FK_655a9bfe2ec449a8febb68c4136 (requesterId=OrderEntity__OrderEntity_requester.id)  (cost=25.1 rows=47.1) (actual time=0.815..6.13 rows=50 loops=19999)
                        -> Single-row index lookup on OrderEntity__OrderEntity_deliveryPerson using PRIMARY (id=OrderEntity.deliveryPersonId)  (cost=0.766 rows=1) (actual time=0.0115..0.0115 rows=0.9 loops=999951)
                -> Single-row index lookup on OrderEntity__OrderEntity_product using PRIMARY (id=OrderEntity.id)  (cost=0.752 rows=1) (actual time=0.418..0.418 rows=1 loops=100134)
            -> Single-row index lookup on OrderEntity__OrderEntity_transportation using PRIMARY (id=OrderEntity.id)  (cost=0.702 rows=1) (actual time=0.295..0.295 rows=1 loops=100134)
        -> Single-row index lookup on OrderEntity__OrderEntity_destination using PRIMARY (id=OrderEntity.id)  (cost=0.849 rows=1) (actual time=0.545..0.545 rows=1 loops=100134)
    -> Single-row index lookup on OrderEntity__OrderEntity_departure using PRIMARY (id=OrderEntity.id)  (cost=0.85 rows=1) (actual time=0.541..0.541 rows=1 loops=100134)
```

## 해결

### 1차: 불필요한 join 제거

explain analyze에서 `order.requester`, `order.deliveryPerson`에 **불필요한 join 후 필터링까지 141436ms**가 소요되었는데, 이는 **전체 레이턴시(321896ms)중 43%를 차지**했습니다.
아래의 TypeORM 코드에서 `requester`와 `deliveryPerson`이 각각 `walletAddress`로 접근해서 불필요한 join이  발생했습니다.

```ts
requester: { walletAddress: Not(deliverPersonWalletAddress) },
deliveryPerson: { walletAddress: IsNull() },
```

#### 코드

조회 코드와 로그가 길어 QueryBuilder를 사용했습니다.

```diff
  // 중략

  @Transactional()
  async findAllMatchableOrderByWalletAddress(
    deliverPersonWalletAddress: string,
  ) {
    try {
-     const isExistUser = await this.getManager().exists(UserEntity, {
+     const deliveryPerson = await this.getManager().findOne(UserEntity, {
+       select: { id: true },
        where: { walletAddress: deliverPersonWalletAddress },
      });
      

-     if (!isExistUser) {
+     if (!deliveryPerson) {
        throw new NotExistDataException(deliverPersonWalletAddress);
      }

-     const matchableOrders = await this.getManager().find(OrderEntity, {
-       relations: {
-         product: true,
-         transportation: true,
-         destination: true,
-         departure: true,
-       },
-       where: {
-         requester: { walletAddress: Not(deliverPersonWalletAddress) },
-         deliveryPerson: { walletAddress: IsNull() },
-       },
-       select: {
-         id: true,
-         detail: true,
-         product: {
-           width: true,
-           length: true,
-           height: true,
-           weight: true,
-         },
-         transportation: {
-           walking: true,
-           bicycle: true,
-           scooter: true,
-           bike: true,
-           car: true,
-           truck: true,
-         },
-         destination: {
-           x: true,
-           y: true,
-           detail: true,
-         },
-         departure: {
-           x: true,
-           y: true,
-           detail: true,
-         },
-       },
-     });
+     const matchableOrders = await this.getManager()
+       .createQueryBuilder(OrderEntity, 'order')
+       .where('order.requesterId != :deliveryPersonId', {
+         deliveryPersonId: deliveryPerson.id,
+       })
+       .andWhere('order.deliveryPersonId is null')
+       .leftJoin('order.product', 'product')
+       .addSelect([
+         'product.width',
+         'product.length',
+         'product.height',
+         'product.weight',
+       ])
+       .leftJoin('order.transportation', 'transportation')
+       .addSelect([
+         'transportation.walking',
+         'transportation.bicycle',
+         'transportation.scooter',
+         'transportation.bike',
+         'transportation.car',
+         'transportation.truck',
+       ])
+       .leftJoin('order.destination', 'destination')
+       .addSelect(['destination.x', 'destination.y', 'destination.detail'])
+       .leftJoin('order.departure', 'departure')
+       .addSelect(['departure.x', 'departure.y', 'departure.detail'])
+       .getMany();

      return plainToInstance(MatchableOrderDto, matchableOrders);
    } catch (error) {
      if (error instanceof NotExistDataException) {
        throw error;
      }
      throw new UnknownDataBaseException(error);
    }
  }

  // 중략
```

아래와 같이 기존 조회 방식을 변경해도 동일하게 동작합니다.

```ts
requester: Not(deliveryPerson.id),
deliveryPerson: IsNull(),
```

#### 로그

```log
  // 중략

  console.log
    query: SELECT VERSION() AS `version`

      at Function.logInfo (node_modules/src/platform/PlatformTools.ts:235:17)

  console.log
    query: START TRANSACTION

      at Function.logInfo (node_modules/src/platform/PlatformTools.ts:235:17)

  console.log
    query: SELECT `UserEntity`.`id` AS `UserEntity_id` FROM `user` `UserEntity` WHERE ((`UserEntity`.`walletAddress` = ?)) LIMIT 1 -- PARAMETERS: ["0x26d3d7cd73cd63e07feb92eaa9803aebbf9e6fd8"]

      at Function.logInfo (node_modules/src/platform/PlatformTools.ts:235:17)

  console.log
    사용자 조회 소요시간: 38ms

      at QueryBuilderRepository.findAllMatchableOrderByWalletAddress (order1.repository.test.ts:43:15)

  console.log
    query: SELECT `order`.`id` AS `order_id`, `order`.`detail` AS `order_detail`, `order`.`requesterId` AS `order_requesterId`, `order`.`deliveryPersonId` AS `order_deliveryPersonId`, `product`.`width` AS `product_width`, `product`.`length` AS `product_length`, `product`.`height` AS `product_height`, `product`.`weight` AS `product_weight`, `product`.`id` AS `product_id`, `transportation`.`walking` AS `transportation_walking`, `transportation`.`bicycle` AS `transportation_bicycle`, `transportation`.`scooter` AS `transportation_scooter`, `transportation`.`bike` AS `transportation_bike`, `transportation`.`car` AS `transportation_car`, `transportation`.`truck` AS `transportation_truck`, `transportation`.`id` AS `transportation_id`, `destination`.`x` AS `destination_x`, `destination`.`y` AS `destination_y`, `destination`.`detail` AS `destination_detail`, `destination`.`id` AS `destination_id`, `departure`.`x` AS `departure_x`, `departure`.`y` AS `departure_y`, `departure`.`detail` AS `departure_detail`, `departure`.`id` AS `departure_id` 
    FROM `order` `order` LEFT JOIN `product` `product` ON `product`.`id`=`order`.`id`  LEFT JOIN `transportation` `transportation` ON `transportation`.`id`=`order`.`id`  LEFT JOIN `destination` `destination` ON `destination`.`id`=`order`.`id`  LEFT JOIN `departure` `departure` ON `departure`.`id`=`order`.`id` 
    WHERE `order`.`deliveryPersonId` is null AND `order`.`requesterId` != ? 
    -- PARAMETERS: ["082deb21-66e0-443b-a96f-ff40ce5e2cf2"]

      at Function.logInfo (node_modules/src/platform/PlatformTools.ts:235:17)

  console.log
    주문 조회 소요시간: 31581ms

      at QueryBuilderRepository.findAllMatchableOrderByWalletAddress (order1.repository.test.ts:74:15)

  console.log
    클래스 객체 변환 소요시간: 5531ms

      at QueryBuilderRepository.findAllMatchableOrderByWalletAddress (order1.repository.test.ts:83:15)

  console.log
    query: COMMIT

      at Function.logInfo (node_modules/src/platform/PlatformTools.ts:235:17)

  console.log
    메서드 소요 시간: 37257ms

      at order1.repository.test.ts:164:17
```

#### explain

```log
id|select_type|table         |partitions|type  |possible_keys                                                |key                           |key_len|ref             |rows  |filtered|Extra                             |
--+-----------+--------------+----------+------+-------------------------------------------------------------+------------------------------+-------+----------------+------+--------+----------------------------------+
 1|SIMPLE     |order         |          |ref   |FK_655a9bfe2ec449a8febb68c4136,FK_1e808bbe959a8807b2cce4a461f|FK_1e808bbe959a8807b2cce4a461f|1023   |const           |211906|   55.54|Using index condition; Using where|
 1|SIMPLE     |product       |          |eq_ref|PRIMARY                                                      |PRIMARY                       |4      |quicker.order.id|     1|   100.0|                                  |
 1|SIMPLE     |transportation|          |eq_ref|PRIMARY                                                      |PRIMARY                       |4      |quicker.order.id|     1|   100.0|                                  |
 1|SIMPLE     |destination   |          |eq_ref|PRIMARY                                                      |PRIMARY                       |4      |quicker.order.id|     1|   100.0|                                  |
 1|SIMPLE     |departure     |          |eq_ref|PRIMARY                                                      |PRIMARY                       |4      |quicker.order.id|     1|   100.0|                                  |
```

#### explain analyze

```log
 -> Nested loop left join  (cost=366668 rows=117693) (actual time=11.3..27747 rows=100134 loops=1)
    -> Nested loop left join  (cost=268707 rows=117693) (actual time=9.82..23564 rows=100134 loops=1)
        -> Nested loop left join  (cost=170992 rows=117693) (actual time=7.74..19212 rows=100134 loops=1)
            -> Nested loop left join  (cost=100698 rows=117693) (actual time=6.19..15663 rows=100134 loops=1)
                -> Filter: (`order`.requesterId <> '082deb21-66e0-443b-a96f-ff40ce5e2cf2')  (cost=20649 rows=117693) (actual time=4.66..10433 rows=100134 loops=1)
                    -> Index lookup on order using FK_1e808bbe959a8807b2cce4a461f (deliveryPersonId=NULL), with index condition: (`order`.deliveryPersonId is null)  (cost=20649 rows=211906) (actual time=4.66..10109 rows=100141 loops=1)
                -> Single-row index lookup on product using PRIMARY (id=`order`.id)  (cost=0.58 rows=1) (actual time=0.0517..0.0517 rows=1 loops=100134)
            -> Single-row index lookup on transportation using PRIMARY (id=`order`.id)  (cost=0.497 rows=1) (actual time=0.0352..0.0352 rows=1 loops=100134)
        -> Single-row index lookup on destination using PRIMARY (id=`order`.id)  (cost=0.73 rows=1) (actual time=0.0432..0.0432 rows=1 loops=100134)
    -> Single-row index lookup on departure using PRIMARY (id=`order`.id)  (cost=0.732 rows=1) (actual time=0.0414..0.0414 rows=1 loops=100134)
```

#### 성과

개선 전 explain analyze

```log
// 중략

-> Filter: (OrderEntity__OrderEntity_deliveryPerson.walletAddress is null)  (cost=1.81e+6 rows=755152) (actual time=34.1..141436 rows=100134 loops=1)
    -> Nested loop antijoin  (cost=1.81e+6 rows=755152) (actual time=34.1..140485 rows=100134 loops=1)
        -> Nested loop inner join  (cost=480108 rows=755152) (actual time=16.8..128546 rows=999951 loops=1)
            -> Filter: ((OrderEntity__OrderEntity_requester.walletAddress <> '0x26d3d7cd73cd63e07feb92eaa9803aebbf9e6fd8') and (OrderEntity__OrderEntity_requester.id is not null))  (cost=2052 rows=16031) (actual time=12.3..5860 rows=19999 loops=1)
                -> Table scan on OrderEntity__OrderEntity_requester  (cost=2052 rows=17812) (actual time=12.3..567 rows=20000 loops=1)
            -> Index lookup on OrderEntity using FK_655a9bfe2ec449a8febb68c4136 (requesterId=OrderEntity__OrderEntity_requester.id)  (cost=25.1 rows=47.1) (actual time=0.815..6.13 rows=50 loops=19999)
        -> Single-row index lookup on OrderEntity__OrderEntity_deliveryPerson using PRIMARY (id=OrderEntity.deliveryPersonId)  (cost=0.766 rows=1) (actual time=0.0115..0.0115 rows=0.9 loops=999951)

// 중략
```

개선 후 explain analyze

```log
// 중략

-> Filter: (`order`.requesterId <> '082deb21-66e0-443b-a96f-ff40ce5e2cf2')  (cost=20649 rows=117693) (actual time=4.66..10433 rows=100134 loops=1)
    -> Index lookup on order using FK_1e808bbe959a8807b2cce4a461f (deliveryPersonId=NULL), with index condition: (`order`.deliveryPersonId is null)  (cost=20649 rows=211906) (actual time=4.66..10109 rows=100141 loops=1)
-> Single-row index lookup on product using PRIMARY (id=`order`.id)  (cost=0.58 rows=1) (actual time=0.0517..0.0517 rows=1 loops=100134)

// 중략
```

order 테이블에서 필터링까지 **141436ms에서 10433ms로 약 92.6%, 쿼리는 321896ms에서 27747ms로 91.3%, 레포지토리 메서드는 333437ms에서 37257ms로 소요시간을 88.8% 단축**했습니다.

### 2차: 페이지네이션

여전히 레포지토리 메서드는 **37257ms로 오래 걸리고** 다른 작업(로깅, 외부메서드)이 같이 실행되기 위해서 **100ms 이하로 낮춰야 합니다.** 역정규화, 멀티 컬럼 인덱스, 페이지네이션을 생각했고 다음 이유로 페이지네이션을 선택했습니다.

**역정규화**

장점

- join최소화 가능

단점

- 기존 테이블 구조 변경
- `order`와 연관된 레포지토리 코드 전면 수정
  - 일의 규모가 너무 커짐

**멀티 컬럼 인덱스**

장점

- 없음

단점

- 조건절이 `and`면서 `is null` 연산이지만 `!=` 연산이 있어 이점 없음

**페이지네이션**

장점

- I/O가 적고 빠름
- `plainToInstance`의 객체 변환 시간 단축 가능

단점

- 메서드 요청 횟수 증가

**결론**

기존에 조회한 10만 건의 데이터는 전부 필요하지 않고 요청당 20개면(모바일 환경에서 2페이지) 충분하다고 생각했습니다.

#### 코드

아래 문제로 서브쿼리를 사용했습니다.

> join을 사용하면 `offset`, `limit`가 제대로 동작하지 않아 `skip`, `take`를 사용했습니다.
>
> ```ts
>     /**
>      * Sets OFFSET - selection offset.
>      * NOTE that it may not work as you expect if you are using joins.
>      * If you want to implement pagination, and you are having join in your query,
>      * then use the skip method instead.
>      */
>     offset(offset?: number): this;
> ```
>
> **코드**
>
> ```diff
> // 중략
> 
>   @Transactional()
>   async findAllMatchableOrderByWalletAddress(
>     deliverPersonWalletAddress: string,
> +   skipNumber: number = 0,
>   ) {
>     try {
>       const deliveryPerson = await this.getManager().findOne(UserEntity, {
>         select: { id: true },
>         where: { walletAddress: deliverPersonWalletAddress },
>       });
> 
>       if (!deliveryPerson) {
>         throw new NotExistDataException(deliverPersonWalletAddress);
>       }
> 
>       const matchableOrders = await this.getManager()
>         .createQueryBuilder(OrderEntity, 'order')
>         .where('order.requesterId != :deliveryPersonId', {
>           deliveryPersonId: deliveryPerson.id,
>         })
>         .andWhere('order.deliveryPersonId is null')
> +       .take(20)
> +       .skip(skipNumber)
> +       .orderBy('order.id', 'DESC')
>         .leftJoin('order.product', 'product')
>         .addSelect([
>           'product.width',
>           'product.length',
>           'product.height',
>           'product.weight',
>         ])
>         .leftJoin('order.transportation', 'transportation')
>         .addSelect([
>           'transportation.walking',
>           'transportation.bicycle',
>           'transportation.scooter',
>           'transportation.bike',
>           'transportation.car',
>           'transportation.truck',
>         ])
>         .leftJoin('order.destination', 'destination')
>         .addSelect(['destination.x', 'destination.y', 'destination.detail'])
>         .leftJoin('order.departure', 'departure')
>         .addSelect(['departure.x', 'departure.y', 'departure.detail'])
>         .getMany();
> 
>       return plainToInstance(MatchableOrderDto, matchableOrders);
>     } catch (error) {
>       if (error instanceof NotExistDataException) {
>         throw error;
>       }
>       throw new UnknownDataBaseException(error);
>     }
>   }
> 
> // 중략
> ```
>
> `limit`, `offset`대신 `take`, `skip`을 사용했는데 아래와 같이 쿼리가 2번 실행됐습니다.
>
> **로그**
>
> ```log
>   // 중략
> 
>   console.log
>     query: SELECT DISTINCT `distinctAlias`.`order_id` AS `ids_order_id`, `distinctAlias`.`order_id` FROM (SELECT `order`.`id` AS `order_id`, `order`.`detail` AS `order_detail`, `order`.`requesterId` AS `order_requesterId`, `order`.`deliveryPersonId` AS `order_deliveryPersonId`, `product`.`width` AS `product_width`, `product`.`length` AS `product_length`, `product`.`height` AS `product_height`, `product`.`weight` AS `product_weight`, `transportation`.`walking` AS `transportation_walking`, `transportation`.`bicycle` AS `transportation_bicycle`, `transportation`.`scooter` AS `transportation_scooter`, `transportation`.`bike` AS `transportation_bike`, `transportation`.`car` AS `transportation_car`, `transportation`.`truck` AS `transportation_truck`, `destination`.`x` AS `destination_x`, `destination`.`y` AS `destination_y`, `destination`.`detail` AS `destination_detail`, `departure`.`x` AS `departure_x`, `departure`.`y` AS `departure_y`, `departure`.`detail` AS `departure_detail` FROM `order` `order` LEFT JOIN `product` `product` ON `product`.`id`=`order`.`id`  LEFT JOIN `transportation` `transportation` ON `transportation`.`id`=`order`.`id`  LEFT JOIN `destination` `destination` ON `destination`.`id`=`order`.`id`  LEFT JOIN `departure` `departure` ON `departure`.`id`=`order`.`id` WHERE `order`.`requesterId` != ? AND `order`.`deliveryPersonId` is null) `distinctAlias` ORDER BY `distinctAlias`.`order_id` DESC, `order_id` ASC LIMIT 20 -- PARAMETERS: ["082deb21-66e0-443b-a96f-ff40ce5e2cf2"]
>
>      at Function.logInfo (node_modules/src/platform/PlatformTools.ts:235:17)
>
>   console.log
>     query: SELECT `order`.`id` AS `order_id`, `order`.`detail` AS `order_detail`, `order`.`requesterId` AS `order_requesterId`, `order`.`deliveryPersonId` AS `order_deliveryPersonId`, `product`.`width` AS `product_width`, `product`.`length` AS `product_length`, `product`.`height` AS `product_height`, `product`.`weight` AS `product_weight`, `transportation`.`walking` AS `transportation_walking`, `transportation`.`bicycle` AS `transportation_bicycle`, `transportation`.`scooter` AS `transportation_scooter`, `transportation`.`bike` AS `transportation_bike`, `transportation`.`car` AS `transportation_car`, `transportation`.`truck` AS `transportation_truck`, `destination`.`x` AS `destination_x`, `destination`.`y` AS `destination_y`, `destination`.`detail` AS `destination_detail`, `departure`.`x` AS `departure_x`, `departure`.`y` AS `departure_y`, `departure`.`detail` AS `departure_detail` FROM `order` `order` LEFT JOIN `product` `product` ON `product`.`id`=`order`.`id`  LEFT JOIN `transportation` `transportation` ON `transportation`.`id`=`order`.`id`  LEFT JOIN `destination` `destination` ON `destination`.`id`=`order`.`id`  LEFT JOIN `departure` `departure` ON `departure`.`id`=`order`.`id` WHERE ( `order`.`requesterId` != ? AND `order`.`deliveryPersonId` is null ) AND ( `order`.`id` IN (999998, 999995, 999989, 999976, 999967, 999959, 999955, 999948, 999938, 999934, 999895, 999890, 999884, 999880, 999874, 999872, 999870, 999850, 999842, 999839) ) ORDER BY `order`.`id` DESC -- PARAMETERS: ["082deb21-66e0-443b-a96f-ff40ce5e2cf2"]
> 
>       at Function.logInfo (node_modules/src/platform/PlatformTools.ts:235:17)
> 
>   console.log
>     주문 조회 소요시간: 39ms
> 
>       at OrderRepository.findAllMatchableOrderByWalletAddress (src/database/type-orm/repository/order/order.repository.ts:215:15)
> 
>   console.log
>     클래스 객체 변환 소요시간: 3ms
> 
>       at OrderRepository.findAllMatchableOrderByWalletAddress (src/database/type-orm/repository/order/order.repository.ts:220:15)
> 
>   console.log
>     query: COMMIT
> 
>       at Function.logInfo (node_modules/src/platform/PlatformTools.ts:235:17)
> 
>   console.log
>     메서드 소요 시간: 94ms
> 
>       at order1.repository.test.ts:149:17
> ```
>
> 이런 현상이 발생한 이유를 간략하게 설명하면 user와 order가 1:N 관계이고 join하면 아래와 같은 구조로 결과가 나옵니다.
>
> | userId | orderId |
> | :----: | :-----: |
> |   1    |    1    |
> |   1    |    2    |
> |   1    |    3    |
> |   2    |    4    |
> |   2    |    5    |
> |   3    |    6    |
>
> 이때 `LIMIT 3`로 userId별 orderId를 가져오려고 했으나, 아래와 같이 userId가 1인 레코드 3개만 조회됩니다.
>
> | userId | orderId |
> | :----: | :-----: |
> |   1    |    1    |
> |   1    |    2    |
> |   1    |    3    |
>
> TypeORM은 이런 문제를 피하고자 먼저 user 테이블의 id만 `LIMIT`과 `OFFSET`을 적용해 조회한 후, 그 id로 join해 `order` 데이터를 가져옵니다. 이 과정에서 쿼리가 두 번 실행됩니다.
>
> [Medium - Typeorm Pagination에 관한 정리](https://donis-note.medium.com/typeorm-pagination에-관-한-정리-3a92d106a373)

#### 코드

```diff
  // 중략

  @Transactional()
  async findAllMatchableOrderByWalletAddress(
    deliverPersonWalletAddress: string,
    skipNumber: number = 0,
  ) {
    try {
      const deliveryPerson = await this.getManager().findOne(UserEntity, {
        select: { id: true },
        where: { walletAddress: deliverPersonWalletAddress },
      });

      if (!deliveryPerson) {
        throw new NotExistDataException(deliverPersonWalletAddress);
      }

      const matchableOrders = await this.getManager()
        .createQueryBuilder(OrderEntity, 'order')
-       .where('order.requesterId != :deliveryPersonId', {
-         deliveryPersonId: deliveryPerson.id,
-       })
-       .andWhere('order.deliveryPersonId is null')
+       .where((qb) => {
+         const subQuery = qb
+           .subQuery()
+           .select('sq_order.id')
+           .from(OrderEntity, 'sq_order')
+           .where('sq_order.requesterId != :deliveryPersonId', {
+             deliveryPersonId: deliveryPerson.id,
+           })
+           .andWhere('sq_order.deliveryPersonId is null')
+           .orderBy('sq_order.id', 'DESC')
+           .limit(20)
+           .offset(skipNumber)
+           .getQuery();
+
+         return 'order.id IN (SELECT * FROM' + subQuery + ' as t)';
+       })
-       .leftJoin('order.product', 'product')
+       .innerJoin('order.product', 'product')
        .addSelect([
          'product.width',
          'product.length',
          'product.height',
          'product.weight',
        ])
-       .leftJoin('order.transportation', 'transportation')
+       .innerJoin('order.transportation', 'transportation')
        .addSelect([
          'transportation.walking',
          'transportation.bicycle',
          'transportation.scooter',
          'transportation.bike',
          'transportation.car',
          'transportation.truck',
        ])
-       .leftJoin('order.destination', 'destination')
+       .innerJoin('order.destination', 'destination')
        .addSelect(['destination.x', 'destination.y', 'destination.detail'])
-       .leftJoin('order.departure', 'departure')
+       .innerJoin('order.departure', 'departure')
        .addSelect(['departure.x', 'departure.y', 'departure.detail'])
        .getMany();

      return plainToInstance(MatchableOrderDto, matchableOrders);
    } catch (error) {
      if (error instanceof NotExistDataException) {
        throw error;
      }
      throw new UnknownDataBaseException(error);
    }
  }

  // 중략
```

#### 로그

```log
  console.log
    query: SELECT VERSION() AS `version`

      at Function.logInfo (node_modules/src/platform/PlatformTools.ts:235:17)

  console.log
    query: START TRANSACTION

      at Function.logInfo (node_modules/src/platform/PlatformTools.ts:235:17)

  console.log
    query: SELECT `UserEntity`.`id` AS `UserEntity_id` FROM `user` `UserEntity` WHERE ((`UserEntity`.`walletAddress` = ?)) LIMIT 1 -- PARAMETERS: ["0x26d3d7cd73cd63e07feb92eaa9803aebbf9e6fd8"]

      at Function.logInfo (node_modules/src/platform/PlatformTools.ts:235:17)

  console.log
    사용자 조회 소요시간: 17ms

      at OrderRepository.findAllMatchableOrderByWalletAddress (src/database/type-orm/repository/order/order.repository.ts:176:15)

  console.log
    query: SELECT `order`.`id` AS `order_id`, `order`.`detail` AS `order_detail`, `order`.`requesterId` AS `order_requesterId`, `order`.`deliveryPersonId` AS `order_deliveryPersonId`, `product`.`width` AS `product_width`, `product`.`length` AS `product_length`, `product`.`height` AS `product_height`, `product`.`weight` AS `product_weight`, `product`.`id` AS `product_id`, `transportation`.`walking` AS `transportation_walking`, `transportation`.`bicycle` AS `transportation_bicycle`, `transportation`.`scooter` AS `transportation_scooter`, `transportation`.`bike` AS `transportation_bike`, `transportation`.`car` AS `transportation_car`, `transportation`.`truck` AS `transportation_truck`, `transportation`.`id` AS `transportation_id`, `destination`.`x` AS `destination_x`, `destination`.`y` AS `destination_y`, `destination`.`detail` AS `destination_detail`, `destination`.`id` AS `destination_id`, `departure`.`x` AS `departure_x`, `departure`.`y` AS `departure_y`, `departure`.`detail` AS `departure_detail`, `departure`.`id` AS `departure_id` FROM `order` `order` INNER JOIN `product` `product` ON `product`.`id`=`order`.`id`  INNER JOIN `transportation` `transportation` ON `transportation`.`id`=`order`.`id`  INNER JOIN `destination` `destination` ON `destination`.`id`=`order`.`id`  INNER JOIN `departure` `departure` ON `departure`.`id`=`order`.`id` WHERE `order`.`id` IN (SELECT * FROM(SELECT `sq_order`.`id` AS `sq_order_id` FROM `order` `sq_order` WHERE `sq_order`.`requesterId` != ? AND `sq_order`.`deliveryPersonId` is null ORDER BY `sq_order_id` DESC LIMIT 20) as t) -- PARAMETERS: ["082deb21-66e0-443b-a96f-ff40ce5e2cf2"]

      at Function.logInfo (node_modules/src/platform/PlatformTools.ts:235:17)

  console.log
    주문 조회 소요시간: 26ms

      at OrderRepository.findAllMatchableOrderByWalletAddress (src/database/type-orm/repository/order/order.repository.ts:224:15)

  console.log
    클래스 객체 변환 소요시간: 3ms

      at OrderRepository.findAllMatchableOrderByWalletAddress (src/database/type-orm/repository/order/order.repository.ts:229:15)

  console.log
    query: COMMIT

      at Function.logInfo (node_modules/src/platform/PlatformTools.ts:235:17)

  console.log
    메서드 소요 시간: 74ms

      at order1.repository.test.ts:149:17
```

#### explain

```log
id|select_type |table         |partitions|type  |possible_keys                                                |key                           |key_len|ref                    |rows  |filtered|Extra                           |
--+------------+--------------+----------+------+-------------------------------------------------------------+------------------------------+-------+-----------------------+------+--------+--------------------------------+
 1|PRIMARY     |<subquery2>   |          |ALL   |                                                             |                              |       |                       |      |   100.0|                                |
 1|PRIMARY     |order         |          |eq_ref|PRIMARY                                                      |PRIMARY                       |4      |<subquery2>.sq_order_id|     1|   100.0|                                |
 1|PRIMARY     |departure     |          |eq_ref|PRIMARY                                                      |PRIMARY                       |4      |<subquery2>.sq_order_id|     1|   100.0|                                |
 1|PRIMARY     |destination   |          |eq_ref|PRIMARY                                                      |PRIMARY                       |4      |<subquery2>.sq_order_id|     1|   100.0|                                |
 1|PRIMARY     |product       |          |eq_ref|PRIMARY                                                      |PRIMARY                       |4      |<subquery2>.sq_order_id|     1|   100.0|                                |
 1|PRIMARY     |transportation|          |eq_ref|PRIMARY                                                      |PRIMARY                       |4      |<subquery2>.sq_order_id|     1|   100.0|                                |
 2|MATERIALIZED|<derived3>    |          |ALL   |                                                             |                              |       |                       |    20|   100.0|                                |
 3|DERIVED     |sq_order      |          |ref   |FK_655a9bfe2ec449a8febb68c4136,FK_1e808bbe959a8807b2cce4a461f|FK_1e808bbe959a8807b2cce4a461f|1023   |const                  |211906|   55.54|Using where; Backward index scan|
```

#### explain analyze

```log
-> Nested loop inner join  (cost=30148 rows=20) (actual time=1.01..1.29 rows=20 loops=1)
    -> Nested loop inner join  (cost=30132 rows=20) (actual time=1.01..1.23 rows=20 loops=1)
        -> Nested loop inner join  (cost=30115 rows=20) (actual time=0.999..1.15 rows=20 loops=1)
            -> Nested loop inner join  (cost=30097 rows=20) (actual time=0.993..1.1 rows=20 loops=1)
                -> Nested loop inner join  (cost=30080 rows=20) (actual time=0.986..1.04 rows=20 loops=1)
                    -> Table scan on <subquery2>  (cost=30075..30077 rows=20) (actual time=0.97..0.972 rows=20 loops=1)
                        -> Materialize with deduplication  (cost=30075..30075 rows=20) (actual time=0.969..0.969 rows=20 loops=1)
                            -> Table scan on t  (cost=30070..30073 rows=20) (actual time=0.232..0.234 rows=20 loops=1)
                                -> Materialize  (cost=30070..30070 rows=20) (actual time=0.23..0.23 rows=20 loops=1)
                                    -> Limit: 20 row(s)  (cost=30068 rows=20) (actual time=0.205..0.214 rows=20 loops=1)
                                        -> Filter: ((sq_order.requesterId <> '082deb21-66e0-443b-a96f-ff40ce5e2cf2') and (sq_order.deliveryPersonId is null))  (cost=30068 rows=117693) (actual time=0.204..0.211 rows=20 loops=1)
                                            -> Index lookup on sq_order using FK_1e808bbe959a8807b2cce4a461f (deliveryPersonId=NULL) (reverse)  (cost=30068 rows=211906) (actual time=0.2..0.204 rows=20 loops=1)
                    -> Single-row index lookup on order using PRIMARY (id=`<subquery2>`.sq_order_id)  (cost=0.741 rows=1) (actual time=0.00304..0.00307 rows=1 loops=20)
                -> Single-row index lookup on departure using PRIMARY (id=`<subquery2>`.sq_order_id)  (cost=15.6 rows=1) (actual time=0.00258..0.00261 rows=1 loops=20)
            -> Single-row index lookup on destination using PRIMARY (id=`<subquery2>`.sq_order_id)  (cost=15.7 rows=1) (actual time=0.00238..0.00242 rows=1 loops=20)
        -> Single-row index lookup on product using PRIMARY (id=`<subquery2>`.sq_order_id)  (cost=14.7 rows=1) (actual time=0.00366..0.00369 rows=1 loops=20)
    -> Single-row index lookup on transportation using PRIMARY (id=`<subquery2>`.sq_order_id)  (cost=14.9 rows=1) (actual time=0.0029..0.00294 rows=1 loops=20)
```

#### 성과

order 테이블에서 데이터 조회를 **10만 건에서 20건으로 줄인 대신, 필터링을 10433ms에서 0.972ms로, 쿼리는 27747ms에서 1.29ms로, 레포지토리 메서드는 37257ms에서 74ms로 레이턴시를 단축**했습니다.

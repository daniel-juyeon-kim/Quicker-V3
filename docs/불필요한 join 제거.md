## 문제

아래의 환경과 연동한 "배송원이 매칭 가능한 의뢰 조회" 테스트는 레이턴시가 **333437ms**로 길었습니다.

**DB 환경**

- AWS RDS db.t4g.micro (MySQL Community)
- 100만 order 레코드(10%는 매칭 X)
- 2만 user 레코드(1인당 평균 의뢰 50개)

**ERD**

![ERD](./quicker.jpeg)

> **비즈니스 요구사항**
>
> - 자신이 올린 주문은 조회 X
> - 이미 매칭된 주문은 조회 X

### 코드

가독성을 위해 본문의 소요시간 출력 코드는 모두 삭제했습니다.

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
    의뢰 조회 소요시간: 327850ms

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

                // 불필요한 join 발생 시작

                -> Filter: (OrderEntity__OrderEntity_deliveryPerson.walletAddress is null)  (cost=1.81e+6 rows=755152) (actual time=34.1..141436 rows=100134 loops=1)
                    -> Nested loop antijoin  (cost=1.81e+6 rows=755152) (actual time=34.1..140485 rows=100134 loops=1)
                        -> Nested loop inner join  (cost=480108 rows=755152) (actual time=16.8..128546 rows=999951 loops=1)
                            -> Filter: ((OrderEntity__OrderEntity_requester.walletAddress <> '0x26d3d7cd73cd63e07feb92eaa9803aebbf9e6fd8') and (OrderEntity__OrderEntity_requester.id is not null))  (cost=2052 rows=16031) (actual time=12.3..5860 rows=19999 loops=1)
                                -> Table scan on OrderEntity__OrderEntity_requester  (cost=2052 rows=17812) (actual time=12.3..567 rows=20000 loops=1)
                            -> Index lookup on OrderEntity using FK_655a9bfe2ec449a8febb68c4136 (requesterId=OrderEntity__OrderEntity_requester.id)  (cost=25.1 rows=47.1) (actual time=0.815..6.13 rows=50 loops=19999)
                        -> Single-row index lookup on OrderEntity__OrderEntity_deliveryPerson using PRIMARY (id=OrderEntity.deliveryPersonId)  (cost=0.766 rows=1) (actual time=0.0115..0.0115 rows=0.9 loops=999951)

                // 불필요한 join 발생 끝

                -> Single-row index lookup on OrderEntity__OrderEntity_product using PRIMARY (id=OrderEntity.id)  (cost=0.752 rows=1) (actual time=0.418..0.418 rows=1 loops=100134)
            -> Single-row index lookup on OrderEntity__OrderEntity_transportation using PRIMARY (id=OrderEntity.id)  (cost=0.702 rows=1) (actual time=0.295..0.295 rows=1 loops=100134)
        -> Single-row index lookup on OrderEntity__OrderEntity_destination using PRIMARY (id=OrderEntity.id)  (cost=0.849 rows=1) (actual time=0.545..0.545 rows=1 loops=100134)
    -> Single-row index lookup on OrderEntity__OrderEntity_departure using PRIMARY (id=OrderEntity.id)  (cost=0.85 rows=1) (actual time=0.541..0.541 rows=1 loops=100134)
```

## 해결

위 `EXPLAIN ANALYZE`에서 `order.requester`, `order.deliveryPerson`에 **불필요한 join, 필터링까지 141436ms**로 **전체 레이턴시(321896ms) 중 43%**입니다.
아래의 코드에서 `requester`, `deliveryPerson`이 각각 `walletAddress`에 접근해서 발생한 문제였습니다.

```ts
requester: { walletAddress: Not(deliverPersonWalletAddress) },
deliveryPerson: { walletAddress: IsNull() },
```

### 코드

조회 코드, 로그가 길어 QueryBuilder를 사용했습니다.

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

아래와 같이 기존 조회 방식을 변경해도 됩니다.

```ts
requester: Not(deliveryPerson.id),
deliveryPerson: IsNull(),
```

### 로그

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
    의뢰 조회 소요시간: 31581ms

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

### explain

```log
id|select_type|table         |partitions|type  |possible_keys                                                |key                           |key_len|ref             |rows  |filtered|Extra                             |
--+-----------+--------------+----------+------+-------------------------------------------------------------+------------------------------+-------+----------------+------+--------+----------------------------------+
 1|SIMPLE     |order         |          |ref   |FK_655a9bfe2ec449a8febb68c4136,FK_1e808bbe959a8807b2cce4a461f|FK_1e808bbe959a8807b2cce4a461f|1023   |const           |211906|   55.54|Using index condition; Using where|
 1|SIMPLE     |product       |          |eq_ref|PRIMARY                                                      |PRIMARY                       |4      |quicker.order.id|     1|   100.0|                                  |
 1|SIMPLE     |transportation|          |eq_ref|PRIMARY                                                      |PRIMARY                       |4      |quicker.order.id|     1|   100.0|                                  |
 1|SIMPLE     |destination   |          |eq_ref|PRIMARY                                                      |PRIMARY                       |4      |quicker.order.id|     1|   100.0|                                  |
 1|SIMPLE     |departure     |          |eq_ref|PRIMARY                                                      |PRIMARY                       |4      |quicker.order.id|     1|   100.0|                                  |
```

### explain analyze

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

### 성과

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

order 테이블에서 **필터링까지 141436ms → 10433ms 약 92.6%, 쿼리는 321896ms → 27747ms 91.3%, 전체 레이턴시는 333437ms → 37257ms로 88.8% 단축**했습니다.

## 문제

아래의 환경과 연동한 주문(배송원이 수락가능한 주문) 조회 테스트 코드의 레이턴시가 23830ms로 오래 걸렸습니다.

DB 환경

- AWS RDS db.t4g.micro (MySQL Community)
- 100만 order 레코드(90%는 배송원 매칭됨, 즉 조회 대상은 10만 order 레코드)
- 2만 user 레코드(1인 당 평균 50개 주문)

ERD

![ERD](./quicker.jpeg)

> **비즈니스 요구사항**
>
> - 자신이 올린 주문은 조회 안됨
> - 이미 매칭된 주문은 조회 안됨

### 코드

```ts

// 중략

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
// 중략

describe('OrderRepository', () => {
  
  // 중략

  describe('findAllMatchableOrderByWalletAddress', () => {
    test('통과하는 테스트, 배송원이 수락한 주문과 생성한 주문은 조회되지 않음', async () => {
      const DELIVERY_PERSON_2_WALLET_ADDRESS =
        '0xc0c42f9750d4daaededd29c8d4e3bd7e5cc0c14a';
      await cls.run(async () => {
        cls.set(ENTITY_MANAGER_KEY, manager);

        const start = Date.now();
        const orders = await repository.findAllMatchableOrderByWalletAddress(
          DELIVERY_PERSON_2_WALLET_ADDRESS,
        );

        console.log(Date.now() - start + 'ms');
        console.log(orders.length);
      });
    }, 10000000);
  });

  // 중략

});
```

### 로그

```log
console.log
  query: SELECT VERSION() AS `version`

    at Function.logInfo (node_modules/src/platform/PlatformTools.ts:235:17)

console.log
  query: START TRANSACTION

    at Function.logInfo (node_modules/src/platform/PlatformTools.ts:235:17)

console.log
  query: SELECT 1 AS `row_exists` FROM (SELECT 1 AS dummy_column) `dummy_table` WHERE EXISTS (SELECT 1 FROM `user` `UserEntity` WHERE ((`UserEntity`.`walletAddress` = ?))) LIMIT 1 -- PARAMETERS: ["0x919e0db75abaf1ce9aace65004dc3d771494dd17"]

    at Function.logInfo (node_modules/src/platform/PlatformTools.ts:235:17)

console.log
  query: SELECT `OrderEntity`.`id` AS `OrderEntity_id`, `OrderEntity`.`detail` AS `OrderEntity_detail`, 
  `OrderEntity__OrderEntity_product`.`width` AS `OrderEntity__OrderEntity_product_width`, 
  `OrderEntity__OrderEntity_product`.`length` AS `OrderEntity__OrderEntity_product_length`, 
  `OrderEntity__OrderEntity_product`.`height` AS `OrderEntity__OrderEntity_product_height`, 
  `OrderEntity__OrderEntity_product`.`weight` AS `OrderEntity__OrderEntity_product_weight`, 
  `OrderEntity__OrderEntity_product`.`id` AS `OrderEntity__OrderEntity_product_id`, 
  `OrderEntity__OrderEntity_transportation`.`walking` AS `OrderEntity__OrderEntity_transportation_walking`, 
  `OrderEntity__OrderEntity_transportation`.`bicycle` AS `OrderEntity__OrderEntity_transportation_bicycle`, 
  `OrderEntity__OrderEntity_transportation`.`scooter` AS `OrderEntity__OrderEntity_transportation_scooter`, 
  `OrderEntity__OrderEntity_transportation`.`bike` AS `OrderEntity__OrderEntity_transportation_bike`, 
  `OrderEntity__OrderEntity_transportation`.`car` AS `OrderEntity__OrderEntity_transportation_car`, 
  `OrderEntity__OrderEntity_transportation`.`truck` AS `OrderEntity__OrderEntity_transportation_truck`, 
  `OrderEntity__OrderEntity_transportation`.`id` AS `OrderEntity__OrderEntity_transportation_id`, 
  `OrderEntity__OrderEntity_destination`.`x` AS `OrderEntity__OrderEntity_destination_x`, 
  `OrderEntity__OrderEntity_destination`.`y` AS `OrderEntity__OrderEntity_destination_y`, 
  `OrderEntity__OrderEntity_destination`.`detail` AS `OrderEntity__OrderEntity_destination_detail`, 
  `OrderEntity__OrderEntity_destination`.`id` AS `OrderEntity__OrderEntity_destination_id`, 
  `OrderEntity__OrderEntity_departure`.`x` AS `OrderEntity__OrderEntity_departure_x`, 
  `OrderEntity__OrderEntity_departure`.`y` AS `OrderEntity__OrderEntity_departure_y`, 
  `OrderEntity__OrderEntity_departure`.`detail` AS `OrderEntity__OrderEntity_departure_detail`, 
  `OrderEntity__OrderEntity_departure`.`id` AS `OrderEntity__OrderEntity_departure_id`
  FROM `order` `OrderEntity`
  LEFT JOIN `product` `OrderEntity__OrderEntity_product` ON `OrderEntity__OrderEntity_product`.`id`=`OrderEntity`.`id` 
  LEFT JOIN `transportation` `OrderEntity__OrderEntity_transportation` ON `OrderEntity__OrderEntity_transportation`.`id`=`OrderEntity`.`id`  
  LEFT JOIN `destination` `OrderEntity__OrderEntity_destination` ON `OrderEntity__OrderEntity_destination`.`id`=`OrderEntity`.`id`  
  LEFT JOIN `departure` `OrderEntity__OrderEntity_departure` ON `OrderEntity__OrderEntity_departure`.`id`=`OrderEntity`.`id`  
  LEFT JOIN `user` `OrderEntity__OrderEntity_requester` ON `OrderEntity__OrderEntity_requester`.`id`=`OrderEntity`.`requesterId`  
  LEFT JOIN `user` `OrderEntity__OrderEntity_deliveryPerson` ON `OrderEntity__OrderEntity_deliveryPerson`.`id`=`OrderEntity`.`deliveryPersonId` 
  WHERE ((((`OrderEntity__OrderEntity_requester`.`walletAddress` != ?))) AND (((`OrderEntity__OrderEntity_deliveryPerson`.`walletAddress` IS NULL))))
  -- PARAMETERS: ["0x919e0db75abaf1ce9aace65004dc3d771494dd17"]

    at Function.logInfo (node_modules/src/platform/PlatformTools.ts:235:17)

console.log
  query: COMMIT

    at Function.logInfo (node_modules/src/platform/PlatformTools.ts:235:17)

console.log
  23830ms // 걸린 시간

    at order1.repository.test.ts:131:17

console.log
  99996   // 데이터 수

    at order1.repository.test.ts:132:17

// 중략
```

### 실행 계획

#### explain

```txt
id|select_type|table                                  |partitions|type  |possible_keys                 |key    |key_len|ref                                 |rows  |filtered|Extra                  |
--+-----------+---------------------------------------+----------+------+------------------------------+-------+-------+------------------------------------+------+--------+-----------------------+
 1|SIMPLE     |OrderEntity                            |          |ALL   |FK_655a9bfe2ec449a8febb68c4136|       |       |                                    |989823|   100.0|                       |
 1|SIMPLE     |OrderEntity__OrderEntity_requester     |          |eq_ref|PRIMARY                       |PRIMARY|1022   |quicker.OrderEntity.requesterId     |     1|    90.0|Using where            |
 1|SIMPLE     |OrderEntity__OrderEntity_deliveryPerson|          |eq_ref|PRIMARY                       |PRIMARY|1022   |quicker.OrderEntity.deliveryPersonId|     1|    10.0|Using where; Not exists|
 1|SIMPLE     |OrderEntity__OrderEntity_product       |          |eq_ref|PRIMARY                       |PRIMARY|4      |quicker.OrderEntity.id              |     1|   100.0|                       |
 1|SIMPLE     |OrderEntity__OrderEntity_transportation|          |eq_ref|PRIMARY                       |PRIMARY|4      |quicker.OrderEntity.id              |     1|   100.0|                       |
 1|SIMPLE     |OrderEntity__OrderEntity_destination   |          |eq_ref|PRIMARY                       |PRIMARY|4      |quicker.OrderEntity.id              |     1|   100.0|                       |
 1|SIMPLE     |OrderEntity__OrderEntity_departure     |          |eq_ref|PRIMARY                       |PRIMARY|4      |quicker.OrderEntity.id              |     1|   100.0|                       |
```

#### explain analyze

```log
-> Nested loop left join  (cost=2.24e+6 rows=890841) (actual time=4.41..4757 rows=99996 loops=1)
    -> Nested loop left join  (cost=2.06e+6 rows=890841) (actual time=4.03..4593 rows=99996 loops=1)
        -> Nested loop left join  (cost=1.9e+6 rows=890841) (actual time=3.56..4381 rows=99996 loops=1)
            -> Nested loop left join  (cost=1.72e+6 rows=890841) (actual time=2.88..4228 rows=99996 loops=1)
                -> Filter: (OrderEntity__OrderEntity_deliveryPerson.walletAddress is null)  (cost=1.57e+6 rows=890841) (actual time=1.29..4030 rows=99996 loops=1)
                    -> Nested loop antijoin  (cost=1.57e+6 rows=890841) (actual time=1.28..4024 rows=99996 loops=1)
                        -> Nested loop inner join  (cost=453651 rows=890841) (actual time=0.876..2362 rows=999949 loops=1)
                            -> Table scan on OrderEntity  (cost=107213 rows=989823) (actual time=0.612..336 rows=1e+6 loops=1)
                            -> Filter: (OrderEntity__OrderEntity_requester.walletAddress <> '0x919e0db75abaf1ce9aace65004dc3d771494dd17')  (cost=0.25 rows=0.9) (actual time=0.00185..0.00191 rows=1 loops=1e+6)
                                -> Single-row index lookup on OrderEntity__OrderEntity_requester using PRIMARY (id = OrderEntity.requesterId)  (cost=0.25 rows=1) (actual time=0.00173..0.00176 rows=1 loops=1e+6)
                        -> Single-row index lookup on OrderEntity__OrderEntity_deliveryPerson using PRIMARY (id = OrderEntity.deliveryPersonId)  (cost=0.25 rows=1) (actual time=0.00159..0.00159 rows=0.9 loops=999949)
                -> Single-row index lookup on OrderEntity__OrderEntity_product using PRIMARY (id = OrderEntity.id)  (cost=0.766 rows=1) (actual time=0.00183..0.00185 rows=1 loops=99996)
            -> Single-row index lookup on OrderEntity__OrderEntity_transportation using PRIMARY (id = OrderEntity.id)  (cost=0.959 rows=1) (actual time=0.00139..0.00141 rows=1 loops=99996)
        -> Single-row index lookup on OrderEntity__OrderEntity_destination using PRIMARY (id = OrderEntity.id)  (cost=0.822 rows=1) (actual time=0.00197..0.002 rows=1 loops=99996)
    -> Single-row index lookup on OrderEntity__OrderEntity_departure using PRIMARY (id = OrderEntity.id)  (cost=0.952 rows=1) (actual time=0.00149..0.00151 rows=1 loops=99996)
```

## 문제점 분석

explain analyze에서 `order.requester`, `order.deliveryPerson`에 불필요한 join이 발생했고 필터링까지 4030ms가 걸렸습니다. 이는 전체 4757ms중 87%로 레이턴시 증가의 원인입니다.

아래의 TypeORM 코드로 `requester`와 `deliveryPerson`이 각각 `walletAddress`로 접근해 불필요한 join이 발생했습니다.

```ts
requester: { walletAddress: Not(deliverPersonWalletAddress) },
deliveryPerson: { walletAddress: IsNull() },
```

### 해결

기존 코드는 배송원의 지갑주소로 회원정보의 존재 여부만 확인했습니다. 변경 변경된 코드는 배송원의 지갑주소로 id를 가져와 다음 쿼리에 사용합니다.

#### 기존

```ts
// 중략
const isExistUser = await this.getManager().exists(UserEntity, {
  where: { walletAddress: deliverPersonWalletAddress },
});

if (!isExistUser) {
  throw new NotExistDataException(deliverPersonWalletAddress);
}

const matchableOrders = await this.getManager().find(OrderEntity, {
  // 중략
  where: {
    requester: { walletAddress: Not(deliverPersonWalletAddress) },
    deliveryPerson: { walletAddress: IsNull() },
  },
  // 중략
});

// 중략
```

#### 변경 후

```ts
  // 중략

  @Transactional()
  async findAllMatchableOrderByWalletAddress(
    deliverPersonWalletAddress: string,
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
        .where('order.requesterId != :deliveryPersonId', {
          deliveryPersonId: deliveryPerson.id,
        })
        .andWhere('order.deliveryPersonId is null')
        .leftJoin('order.product', 'product')
        .addSelect([
          'product.width',
          'product.length',
          'product.height',
          'product.weight',
        ])
        .leftJoin('order.transportation', 'transportation')
        .addSelect([
          'transportation.walking',
          'transportation.bicycle',
          'transportation.scooter',
          'transportation.bike',
          'transportation.car',
          'transportation.truck',
        ])
        .leftJoin('order.destination', 'destination')
        .addSelect(['destination.x', 'destination.y', 'destination.detail'])
        .leftJoin('order.departure', 'departure')
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

조회 코드와 로그가 길어 QueryBuilder를 사용해 `requester`와 `deliveryPerson`의 `id`로 접근했습니다. 아래와 같이 기존 조회 방식을 변경해도 동일하게 동작합니다.

```ts
requester: Not(deliveryPerson.id),
deliveryPerson: IsNull(),
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
    query: SELECT `UserEntity`.`id` AS `UserEntity_id` FROM `user` `UserEntity` WHERE ((`UserEntity`.`walletAddress` = ?)) LIMIT 1 -- PARAMETERS: ["0x919e0db75abaf1ce9aace65004dc3d771494dd17"]

      at Function.logInfo (node_modules/src/platform/PlatformTools.ts:235:17)

  console.log
    query: SELECT `order`.`id` AS `order_id`, `order`.`detail` AS `order_detail`, 
    `order`.`requesterId` AS `order_requesterId`, `order`.`deliveryPersonId` AS `order_deliveryPersonId`, 
    `product`.`width` AS `product_width`, `product`.`length` AS `product_length`, 
    `product`.`height` AS `product_height`, `product`.`weight` AS `product_weight`, 
    `product`.`id` AS `product_id`, `transportation`.`walking` AS `transportation_walking`, 
    `transportation`.`bicycle` AS `transportation_bicycle`, 
    `transportation`.`scooter` AS `transportation_scooter`, `transportation`.`bike` AS `transportation_bike`,
    `transportation`.`car` AS `transportation_car`, `transportation`.`truck` AS `transportation_truck`, `transportation`.`id` AS `transportation_id`, `destination`.`x` AS `destination_x`,
    `destination`.`y` AS `destination_y`, `destination`.`detail` AS `destination_detail`, 
    `destination`.`id` AS `destination_id`, `departure`.`x` AS `departure_x`, `departure`.`y` AS `departure_y`,
    `departure`.`detail` AS `departure_detail`, `departure`.`id` AS `departure_id` 
    FROM `order` `order` 
    LEFT JOIN `product` `product` ON `product`.`id`=`order`.`id`  
    LEFT JOIN `transportation` `transportation` ON `transportation`.`id`=`order`.`id`  
    LEFT JOIN `destination` `destination` ON `destination`.`id`=`order`.`id`  
    LEFT JOIN `departure` `departure` ON `departure`.`id`=`order`.`id` 
    WHERE `order`.`requesterId` != ? AND `order`.`deliveryPersonId` is null
    -- PARAMETERS: ["16fea8f1-8e77-4d46-953d-3da9573c3036"]

      at Function.logInfo (node_modules/src/platform/PlatformTools.ts:235:17)

  console.log
    query: COMMIT

      at Function.logInfo (node_modules/src/platform/PlatformTools.ts:235:17)

  console.log
    18624ms   // 걸린 시간

      at order1.repository.test.ts:145:17

  console.log
    99996     // 데이터 수

      at order1.repository.test.ts:146:17
```

#### explain

```
id|select_type|table         |partitions|type  |possible_keys                                                |key                           |key_len|ref             |rows  |filtered|Extra                             |
--+-----------+--------------+----------+------+-------------------------------------------------------------+------------------------------+-------+----------------+------+--------+----------------------------------+
 1|SIMPLE     |order         |          |ref   |FK_655a9bfe2ec449a8febb68c4136,FK_1e808bbe959a8807b2cce4a461f|FK_1e808bbe959a8807b2cce4a461f|1023   |const           |210130|   67.71|Using index condition; Using where|
 1|SIMPLE     |product       |          |eq_ref|PRIMARY                                                      |PRIMARY                       |4      |quicker.order.id|     1|   100.0|                                  |
 1|SIMPLE     |transportation|          |eq_ref|PRIMARY                                                      |PRIMARY                       |4      |quicker.order.id|     1|   100.0|                                  |
 1|SIMPLE     |destination   |          |eq_ref|PRIMARY                                                      |PRIMARY                       |4      |quicker.order.id|     1|   100.0|                                  |
 1|SIMPLE     |departure     |          |eq_ref|PRIMARY                                                      |PRIMARY                       |4      |quicker.order.id|     1|   100.0|                                  |
```

#### explain analyze

```log
-> Nested loop left join  (cost=530254 rows=142287) (actual time=11.3..1454 rows=99996 loops=1)
    -> Nested loop left join  (cost=396694 rows=142287) (actual time=9.8..1228 rows=99996 loops=1)
        -> Nested loop left join  (cost=281448 rows=142287) (actual time=7.58..916 rows=99996 loops=1)
            -> Nested loop left join  (cost=144457 rows=142287) (actual time=3.79..739 rows=99996 loops=1)
                -> Filter: (`order`.requesterId <> '16fea8f1-8e77-4d46-953d-3da9573c3036')  (cost=36032 rows=142287) (actual time=1.38..462 rows=99996 loops=1)
                    -> Index lookup on order using FK_1e808bbe959a8807b2cce4a461f (deliveryPersonId = NULL), with index condition: (`order`.deliveryPersonId is null)  (cost=36032 rows=210130) (actual time=1.09..453 rows=100000 loops=1)
                -> Single-row index lookup on product using PRIMARY (id = `order`.id)  (cost=0.662 rows=1) (actual time=0.00262..0.00264 rows=1 loops=99996)
            -> Single-row index lookup on transportation using PRIMARY (id = `order`.id)  (cost=0.863 rows=1) (actual time=0.00163..0.00165 rows=1 loops=99996)
        -> Single-row index lookup on destination using PRIMARY (id = `order`.id)  (cost=0.71 rows=1) (actual time=0.00298..0.003 rows=1 loops=99996)
    -> Single-row index lookup on departure using PRIMARY (id = `order`.id)  (cost=0.839 rows=1) (actual time=0.00211..0.00213 rows=1 loops=99996)
```

### 전 후 비교, 성과

#### 개선 전 explain analyze

```log
// 중략

-> Filter: (OrderEntity__OrderEntity_deliveryPerson.walletAddress is null)  (cost=1.57e+6 rows=890841) (actual time=1.29..4030 rows=99996 loops=1)
    -> Nested loop antijoin  (cost=1.57e+6 rows=890841) (actual time=1.28..4024 rows=99996 loops=1)
        -> Nested loop inner join  (cost=453651 rows=890841) (actual time=0.876..2362 rows=999949 loops=1)
            -> Table scan on OrderEntity  (cost=107213 rows=989823) (actual time=0.612..336 rows=1e+6 loops=1)
            -> Filter: (OrderEntity__OrderEntity_requester.walletAddress <> '0x919e0db75abaf1ce9aace65004dc3d771494dd17')  (cost=0.25 rows=0.9) (actual time=0.00185..0.00191 rows=1 loops=1e+6)
                -> Single-row index lookup on OrderEntity__OrderEntity_requester using PRIMARY (id = OrderEntity.requesterId)  (cost=0.25 rows=1) (actual time=0.00173..0.00176 rows=1 loops=1e+6)
        -> Single-row index lookup on OrderEntity__OrderEntity_deliveryPerson using PRIMARY (id = OrderEntity.deliveryPersonId)  (cost=0.25 rows=1) (actual time=0.00159..0.00159 rows=0.9 loops=999949)
-> Single-row index lookup on OrderEntity__OrderEntity_product using PRIMARY (id = OrderEntity.id)  (cost=0.766 rows=1) (actual time=0.00183..0.00185 rows=1 loops=99996)

// 중략
```

#### 개선 후 explain analyze

```log
// 중략

-> Filter: (`order`.requesterId <> '16fea8f1-8e77-4d46-953d-3da9573c3036')  (cost=36032 rows=142287) (actual time=1.38..462 rows=99996 loops=1)
    -> Index lookup on order using FK_1e808bbe959a8807b2cce4a461f (deliveryPersonId = NULL), with index condition: (`order`.deliveryPersonId is null)  (cost=36032 rows=210130) (actual time=1.09..453 rows=100000 loops=1)
-> Single-row index lookup on product using PRIMARY (id = `order`.id)  (cost=0.662 rows=1) (actual time=0.00262..0.00264 rows=1 loops=99996)

// 중략
```

order에서 필요한 정보를 필터링하는데 4030ms에서 462ms로 약 8.72배, 전체 레이턴시는 4757ms에서 1454ms로 3.2배 성능 향상이 있었습니다.

## 의문

위 최적화 과정에서 풀스캔과 인덱스 조회가 각각 336ms, 462ms로 거의 동일한 시간이 걸렸습니다.
인덱스 기반 조회가 풀 테이블 스캔보다 빠르다는 지식이 실제 결과와 달라 의문이였습니다.

테스트에 사용한 데이터가 적어서 생긴 문제로 추측되어 데이터를 10배(1,000만) 늘리고 테스트했습니다.

### 조회 성능 테스트(풀 스캔 vs 인덱스)

```sql
SELECT * FROM `order`
WHERE `order`.`requesterId` != "0000682e-3ae0-4b1e-9388-6076078e4ac0" AND `order`.`deliveryPersonId` IS NULL
```

#### 인덱스(옵티마이저)

##### explain

```log
id|select_type|table|partitions|type|possible_keys                                                |key                           |key_len|ref  |rows  |filtered|Extra                             |
--+-----------+-----+----------+----+-------------------------------------------------------------+------------------------------+-------+-----+------+--------+----------------------------------+
 1|SIMPLE     |order|          |ref |FK_655a9bfe2ec449a8febb68c4136,FK_1e808bbe959a8807b2cce4a461f|FK_1e808bbe959a8807b2cce4a461f|1023   |const|210130|    50.0|Using index condition; Using where|
```

##### explain analyze

```log
-> Filter: (`order`.requesterId <> '0000682e-3ae0-4b1e-9388-6076078e4ac0')  (cost=215031 rows=105066) (actual time=4.78..2636 rows=99994 loops=1)
    -> Index lookup on order using FK_1e808bbe959a8807b2cce4a461f (deliveryPersonId=NULL), with index condition: (`order`.deliveryPersonId is null)  (cost=215031 rows=210130) (actual time=4.77..2622 rows=100000 loops=1)
```

#### 풀 테이블 스캔

> `FORCE INDEX(PRIMARY)`로 풀 테이블 스캔을 설정했습니다.

##### explain

```log
id|select_type|table|partitions|type|possible_keys|key|key_len|ref|rows   |filtered|Extra      |
--+-----------+-----+----------+----+-------------+---+-------+---+-------+--------+-----------+
 1|SIMPLE     |order|          |ALL |             |   |       |   |9921108|     9.0|Using where|
```

##### explain analyze

```log
-> Filter: ((`order`.requesterId <> '0000682e-3ae0-4b1e-9388-6076078e4ac0') and (`order`.deliveryPersonId is null))  (cost=10.5e+6 rows=892900) (actual time=1.03..30254 rows=99994 loops=1)
    -> Table scan on order  (cost=10.5e+6 rows=9.92e+6) (actual time=1.02..29142 rows=10e+6 loops=1)
```

### 결론

필터링을 제외한 order 테이블 스캔은 아래와 같은 결과를 보여줬습니다.

인덱스 사용(옵티마이저)

- 레이턴시: 2622ms
- 접근 레코드 수: 10^5

풀 테이블 스캔

- 레이턴시: 29142ms
- 접근 레코드 수: 10^6

#### 알게 된 것

- 옵티마이저는 상황에 따라 적합한 조회 방법을 사용한다.
  - order 100만 건 이상 많아지면 옵티마이저는 인덱스를 사용한다.

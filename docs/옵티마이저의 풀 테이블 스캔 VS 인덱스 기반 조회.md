## 옵티마이저의 풀 테이블 스캔 VS 인덱스 기반 조회

아래와 같은 쿼리에서 **풀 테이블 스캔과 인덱스 조회**가 각각 336ms, 462ms로 **거의 동일한 시간이 걸렸습니다.**
인덱스의 성능이 좋다는 지식과 실제 결과가 달라 데이터를 10배(1,000만) 늘려 테스트했습니다.

```sql
SELECT * FROM `order`
WHERE `order`.`requesterId` != "0000682e-3ae0-4b1e-9388-6076078e4ac0" AND `order`.`deliveryPersonId` IS NULL
```

### 인덱스(옵티마이저 선택)

#### explain

```log
id|select_type|table|partitions|type|possible_keys                                                |key                           |key_len|ref  |rows  |filtered|Extra                             |
--+-----------+-----+----------+----+-------------------------------------------------------------+------------------------------+-------+-----+------+--------+----------------------------------+
 1|SIMPLE     |order|          |ref |FK_655a9bfe2ec449a8febb68c4136,FK_1e808bbe959a8807b2cce4a461f|FK_1e808bbe959a8807b2cce4a461f|1023   |const|210130|    50.0|Using index condition; Using where|
```

#### explain analyze

```log
-> Filter: (`order`.requesterId <> '0000682e-3ae0-4b1e-9388-6076078e4ac0')  (cost=215031 rows=105066) (actual time=4.78..2636 rows=99994 loops=1)
    -> Index lookup on order using FK_1e808bbe959a8807b2cce4a461f (deliveryPersonId=NULL), with index condition: (`order`.deliveryPersonId is null)  (cost=215031 rows=210130) (actual time=4.77..2622 rows=100000 loops=1)
```

### 풀 테이블 스캔

> `FORCE INDEX(PRIMARY)`로 풀 테이블 스캔을 설정했습니다.

#### explain

```log
id|select_type|table|partitions|type|possible_keys|key|key_len|ref|rows   |filtered|Extra      |
--+-----------+-----+----------+----+-------------+---+-------+---+-------+--------+-----------+
 1|SIMPLE     |order|          |ALL |             |   |       |   |9921108|     9.0|Using where|
```

#### explain analyze

```log
-> Filter: ((`order`.requesterId <> '0000682e-3ae0-4b1e-9388-6076078e4ac0') and (`order`.deliveryPersonId is null))  (cost=10.5e+6 rows=892900) (actual time=1.03..30254 rows=99994 loops=1)
    -> Table scan on order  (cost=10.5e+6 rows=9.92e+6) (actual time=1.02..29142 rows=10e+6 loops=1)
```

## 결과

**인덱스 사용(옵티마이저)**

- actual time: 2622ms
- rows: 10^5

**풀 테이블 스캔**

- actual time: 29142ms
- rows: 10^6

order 테이블에 레코드가 100만 개 보다 많아지면 **옵티마이저는 적합한 조회 방법(풀 테이블 스캔 → 인덱스)으로 변경하는 것을 알 수 있었습니다.**

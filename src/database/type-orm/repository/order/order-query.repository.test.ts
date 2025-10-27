import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ENTITY_MANAGER_KEY } from '@src/core/constant';
import { NotExistDataException } from '@src/core/exception';
import { ClsModule, ClsService, ClsServiceManager } from 'nestjs-cls';
import { EntityManager } from 'typeorm';
import { DenormalOrderBuilder } from '../../../../../test/builder/denormal-order.builder';
import { OrderBuilder } from '../../../../../test/builder/order.builder';
import { UserBuilder } from '../../../../../test/builder/user.builder';
import { TestTypeormModule } from '../../../../../test/config/typeorm.module';
import {
  DenormalOrderEntity,
  DepartureEntity,
  DestinationEntity,
  OrderEntity,
  OrderParticipantEntity,
  ProductEntity,
  TransportationEntity,
  UnmatchedOrderEntity,
  UserEntity,
} from '../../entity';
import { TransactionManager } from '../../util/transaction/transaction-manager/transaction-manager';
import { OrderQueryRepository } from './order-query.repository';

describe('OrderQueryRepository', () => {
  let testModule: TestingModule;
  let repository: OrderQueryRepository;
  let manager: EntityManager;
  let cls: ClsService<{ [ENTITY_MANAGER_KEY]: EntityManager }>;

  beforeAll(async () => {
    testModule = await Test.createTestingModule({
      imports: [
        TestTypeormModule,
        TypeOrmModule.forFeature([
          OrderEntity,
          UserEntity,
          ProductEntity,
          DenormalOrderEntity,
          OrderParticipantEntity,
          TransportationEntity,
          DestinationEntity,
          DepartureEntity,
          UnmatchedOrderEntity,
        ]),
        ClsModule,
      ],
      providers: [OrderQueryRepository, TransactionManager],
    }).compile();

    repository = testModule.get(OrderQueryRepository);
    manager = testModule.get(EntityManager);
    cls = ClsServiceManager.getClsService();
  });

  afterEach(async () => {
    await manager.clear(UserEntity);
    await manager.clear(OrderEntity);
    await manager.clear(ProductEntity);
    await manager.clear(DenormalOrderEntity);
    await manager.clear(OrderParticipantEntity);
    await manager.clear(TransportationEntity);
    await manager.clear(DestinationEntity);
    await manager.clear(DepartureEntity);
    await manager.clear(UnmatchedOrderEntity);
  });

  afterAll(async () => {
    await testModule.close();
  });

  describe('findAllCreatedOrDeliveredOrderDetailByOrderIds', () => {
    beforeEach(async () => {
      const requester1 = await manager.save(
        UserEntity,
        new UserBuilder()
          .withId('의뢰인 아이디1')
          .withWalletAddress('의뢰인 지갑주소1')
          .withContact('01012341234')
          .build(),
      );
      const deliveryPerson1 = await manager.save(
        UserEntity,
        new UserBuilder()
          .withId('배송원 아이디1')
          .withWalletAddress('배송원 지갑주소1')
          .withContact('01066868684')
          .build(),
      );
      const requester2 = await manager.save(
        UserEntity,
        new UserBuilder()
          .withId('의뢰인 아이디2')
          .withWalletAddress('의뢰인 지갑주소2')
          .withContact('01054832876')
          .build(),
      );
      const deliveryPerson2 = await manager.save(
        UserEntity,
        new UserBuilder()
          .withId('배송원 아이디2')
          .withWalletAddress('배송원 지갑주소2')
          .withContact('01086544683')
          .build(),
      );

      const order1 = new OrderBuilder()
        .withOrderId(1)
        .withRequester(requester1)
        .withDeliveryPerson(null)
        .build();
      const order2 = new OrderBuilder()
        .withOrderId(2)
        .withRequester(requester2)
        .withDeliveryPerson(null)
        .build();
      const order3 = new OrderBuilder()
        .withOrderId(3)
        .withRequester(deliveryPerson1)
        .withDeliveryPerson(null)
        .build();
      const order4 = new OrderBuilder()
        .withOrderId(4)
        .withRequester(deliveryPerson2)
        .withDeliveryPerson(null)
        .build();

      await manager.save([order1, order2, order3, order4]);
    });

    test('통과하는 테스트', async () => {
      const orderIds = [2, 3];
      const result = [
        {
          id: 3,
          detail: '테스트 주문 상세',
          departure: {
            x: 37.4,
            y: 111,
            detail: '출발지 상세',
            sender: { name: '보내는사람', phone: '010-1234-5678' },
          },
          destination: {
            x: 37.5,
            y: 112,
            detail: '도착지 상세',
            receiver: { name: '받는사람', phone: '010-8765-4321' },
          },
          product: { height: 10, length: 10, weight: 10, width: 10 },
        },
        {
          id: 2,
          detail: '테스트 주문 상세',
          departure: {
            x: 37.4,
            y: 111,
            detail: '출발지 상세',
            sender: { name: '보내는사람', phone: '010-1234-5678' },
          },
          destination: {
            x: 37.5,
            y: 112,
            detail: '도착지 상세',
            receiver: { name: '받는사람', phone: '010-8765-4321' },
          },
          product: { height: 10, length: 10, weight: 10, width: 10 },
        },
      ];

      await cls.run(async () => {
        cls.set(ENTITY_MANAGER_KEY, manager);

        const orders = await repository.findAllOrderDetailsByIds(orderIds);

        expect(orders).toEqual(result);
      });
    });
  });

  describe('findAllUnmatchedOrder', () => {
    const REQUESTER_WALLET_ADDRESS = '의뢰인 지갑주소';
    const DELIVERY_PERSON_1_WALLET_ADDRESS = '배송원1 지갑주소';
    const DELIVERY_PERSON_2_WALLET_ADDRESS = '배송원2 지갑주소';

    beforeEach(async () => {
      const requester = await manager.save(
        UserEntity,
        new UserBuilder()
          .withId('의뢰인')
          .withWalletAddress(REQUESTER_WALLET_ADDRESS)
          .withContact('01012341324')
          .build(),
      );
      const deliveryPerson1 = await manager.save(
        UserEntity,
        new UserBuilder()
          .withId('배송원1')
          .withWalletAddress(DELIVERY_PERSON_1_WALLET_ADDRESS)
          .withContact('01012340987')
          .build(),
      );
      await manager.save(
        UserEntity,
        new UserBuilder()
          .withId('배송원2')
          .withWalletAddress(DELIVERY_PERSON_2_WALLET_ADDRESS)
          .withContact('01009870987')
          .build(),
      );

      const createUnmatchedOrder = async (
        orderId: number,
        requester: UserEntity,
      ) => {
        const participant = new OrderParticipantEntity();
        Object.assign(participant, {
          id: orderId,
          senderName: '발송인 이름',
          senderPhone: '010-1234-1234',
          receiverName: '수취인 이름',
          receiverPhone: '010-0987-0987',
        });

        const denormalOrder = new DenormalOrderBuilder()
          .withId(orderId)
          .withRequester(requester)
          .withParticipant(participant)
          .withDetail('디테일')
          .withTransportation({
            walking: 0,
            bicycle: 1,
            scooter: 0,
            bike: 1,
            car: 0,
            truck: 1,
          })
          .withProduct({ width: 0, length: 0, height: 0, weight: 0 })
          .withDeparture({ x: 0, y: 0, detail: '디테일' })
          .withDestination({ x: 37.5, y: 112, detail: '디테일' })
          .build();

        const unmatchedOrder = new UnmatchedOrderEntity();
        Object.assign(unmatchedOrder, denormalOrder);
        await manager.save(UnmatchedOrderEntity, unmatchedOrder);
      };

      await createUnmatchedOrder(1, requester);
      await createUnmatchedOrder(2, deliveryPerson1);
    });

    test('통과하는 테스트: 의뢰인도 자신의 의뢰를 볼 수 있다.', async () => {
      const requesterOrder = {
        id: 1,
        detail: '디테일',
        departure: { detail: '디테일', x: 0, y: 0 },
        destination: { detail: '디테일', x: 37.5, y: 112 },
        product: { height: 0, length: 0, weight: 0, width: 0 },
        transportation: { bicycle: true, bike: true, truck: true },
      };
      const deliveryPerson1Order = {
        id: 2,
        detail: '디테일',
        departure: { detail: '디테일', x: 0, y: 0 },
        destination: { detail: '디테일', x: 37.5, y: 112 },
        product: { height: 0, length: 0, weight: 0, width: 0 },
        transportation: { bicycle: true, bike: true, truck: true },
      };
      const result = [deliveryPerson1Order, requesterOrder];

      await cls.run(async () => {
        cls.set(ENTITY_MANAGER_KEY, manager);

        await expect(repository.findAllUnmatchedOrder()).resolves.toMatchObject(
          result,
        );
      });
    });

    test('통과하는 테스트: 페이지네이션(cursor) 적용 시, 커서 ID 보다 작은 ID를 가진 결과를 반환한다', async () => {
      const allMatchableOrders = [
        {
          id: 2,
          detail: '디테일',
          departure: { detail: '디테일', x: 0, y: 0 },
          destination: { detail: '디테일', x: 37.5, y: 112 },
          product: { height: 0, length: 0, weight: 0, width: 0 },
          transportation: { bicycle: true, bike: true, truck: true },
        },
        {
          id: 1,
          detail: '디테일',
          departure: { detail: '디테일', x: 0, y: 0 },
          destination: { detail: '디테일', x: 37.5, y: 112 },
          product: { height: 0, length: 0, weight: 0, width: 0 },
          transportation: { bicycle: true, bike: true, truck: true },
        },
      ];
      const paginatedOrders = [allMatchableOrders[1]];
      const cursorOrderId = 2;

      await cls.run(async () => {
        cls.set(ENTITY_MANAGER_KEY, manager);

        await expect(repository.findAllUnmatchedOrder()).resolves.toEqual(
          allMatchableOrders,
        );

        await expect(
          repository.findAllUnmatchedOrder(cursorOrderId),
        ).resolves.toEqual(paginatedOrders);
      });
    });
  });

  describe('findRequesterIdByOrderId', () => {
    const orderId = 1;

    beforeEach(async () => {
      const requester = await manager.save(
        UserEntity,
        new UserBuilder().withId('requester-id').build(),
      );

      const denormalOrder = new DenormalOrderBuilder()
        .withId(orderId)
        .withRequester(requester)
        .build();

      await manager.save(DenormalOrderEntity, denormalOrder);
    });

    test('통과하는 테스트: 주문 아이디로 의뢰인 아이디를 조회한다', async () => {
      const expectedRequesterId = 'requester-id';

      await cls.run(async () => {
        cls.set(ENTITY_MANAGER_KEY, manager);

        await expect(
          repository.findRequesterIdByOrderId(orderId),
        ).resolves.toBe(expectedRequesterId);
      });
    });

    test('실패하는 테스트: 존재하지 않는 주문 아이디를 입력하면 NotExistDataException을 던진다', async () => {
      const nonExistentOrderId = 999;

      await cls.run(async () => {
        cls.set(ENTITY_MANAGER_KEY, manager);

        await expect(
          repository.findRequesterIdByOrderId(nonExistentOrderId),
        ).rejects.toThrow(NotExistDataException);
      });
    });
  });
});

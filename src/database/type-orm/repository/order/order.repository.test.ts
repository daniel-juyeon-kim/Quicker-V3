import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ENTITY_MANAGER_KEY } from '@src/core/constant';
import { MatchableOrderDto } from '@src/router/order/dto/matchable-order.dto';
import { plainToInstance } from 'class-transformer';
import { ClsModule, ClsService, ClsServiceManager } from 'nestjs-cls';
import { afterEach } from 'node:test';
import { EntityManager } from 'typeorm';
import { TestTypeormModule } from '../../../../../test/config/typeorm.module';
import {
  DepartureEntity,
  DestinationEntity,
  OrderEntity,
  ProductEntity,
  TransportationEntity,
  UserEntity,
} from '../../entity';
import {
  BusinessRuleConflictDataException,
  NotExistDataException,
} from '../../util';
import { TransactionManager } from '../../util/transaction/transaction-manager/transaction-manager';
import { OrderRepository } from './order.repository';

const createUser = async (
  manager: EntityManager,
  {
    userId,
    walletAddress,
    contact,
  }: { userId: string; walletAddress: string; contact: string },
) => {
  const user = manager.create(UserEntity, {
    id: userId,
    walletAddress,
    name: '이름',
    email: '이메일',
    contact,
    birthDate: {
      id: userId,
      date: new Date(2000, 9, 12).toISOString(),
    },
    profileImage: {
      id: userId,
    },
    joinDate: {
      id: userId,
      date: new Date(2023, 9, 12).toISOString(),
    },
  });

  return await manager.save(UserEntity, user);
};

const createOrder = async (
  manager: EntityManager,
  {
    requester,
    deliveryPerson,
    orderId,
  }: {
    requester: UserEntity;
    deliveryPerson: UserEntity | null;
    orderId: number;
  },
) => {
  await manager.transaction(async (manager) => {
    const order = manager.create(OrderEntity, {
      id: orderId,
      requester,
      deliveryPerson,
      detail: '디테일',
    });

    await manager.save(order);

    const id = orderId;

    const product = manager.create(ProductEntity, {
      id,
      width: 0,
      length: 0,
      height: 0,
      weight: 0,
      order,
    });

    const transportation = manager.create(TransportationEntity, {
      id,
      walking: 0,
      bicycle: 1,
      scooter: 0,
      bike: 1,
      car: 0,
      truck: 1,
      order,
    });

    const destination = manager.create(DestinationEntity, {
      id,
      x: 37.5,
      y: 112,
      detail: '디테일',
      order,
      receiver: {
        id,
        name: '이름',
        phone: '01012345678',
      },
    });

    const departure = manager.create(DepartureEntity, {
      id,
      x: 0,
      y: 0,
      detail: '디테일',
      order,
      sender: {
        id,
        name: '이름',
        phone: '01012345678',
      },
    });

    await Promise.allSettled([
      manager.save(ProductEntity, product),
      manager.save(TransportationEntity, transportation),
      manager.save(DestinationEntity, destination),
      manager.save(DepartureEntity, departure),
    ]);

    return id;
  });
};

describe('OrderRepository', () => {
  let testModule: TestingModule;
  let repository: OrderRepository;
  let manager: EntityManager;
  let cls: ClsService<{ [ENTITY_MANAGER_KEY]: EntityManager }>;

  beforeEach(async () => {
    testModule = await Test.createTestingModule({
      imports: [
        TestTypeormModule,
        TypeOrmModule.forFeature([
          OrderEntity,
          UserEntity,
          ProductEntity,
          TransportationEntity,
          DestinationEntity,
          DepartureEntity,
          ClsModule,
        ]),
      ],
      providers: [OrderRepository, TransactionManager],
    }).compile();

    repository = testModule.get(OrderRepository);
    manager = testModule.get(EntityManager);
    cls = ClsServiceManager.getClsService();
  });

  describe('createOrder', () => {
    const WALLET_ADDRESS = '지갑주소';

    beforeEach(async () => {
      await createUser(manager, {
        walletAddress: WALLET_ADDRESS,
        userId: '1',
        contact: '01012341234',
      });
    });

    afterEach(async () => {
      await manager.clear(UserEntity);
      await manager.clear(OrderEntity);
    });

    test('통과하는 테스트', async () => {
      const detail = '디테일';
      const product = {
        width: 0,
        length: 0,
        height: 0,
        weight: 0,
      };
      const transportation = {
        bicycle: 1,
        car: 0,
        truck: 0,
      } as const;
      const destination = {
        x: 37.5,
        y: 112,
        detail: '디테일',
      };
      const receiver = {
        name: '이름',
        phone: '01012345678',
      };
      const departure = {
        x: 0,
        y: 0,
        detail: '디테일',
      };
      const sender = {
        name: '이름',
        phone: '01012345678',
      };
      const dto = {
        walletAddress: WALLET_ADDRESS,
        detail,
        receiver,
        destination,
        sender,
        departure,
        product,
        transportation,
      };

      const user = await manager.findOneBy(UserEntity, {
        walletAddress: WALLET_ADDRESS,
      });
      const result = {
        id: 1,
        requester: user,
        detail: '디테일',
        departure: {
          id: 1,
          ...departure,
          sender: { id: 1, ...sender },
        },
        destination: {
          id: 1,
          ...destination,
          receiver: { id: 1, ...receiver },
        },
        product: { id: 1, ...product },
        transportation: {
          id: 1,
          ...{
            bike: 0,
            car: 0,
            scooter: 0,
            truck: 0,
            walking: 0,
          },
          ...transportation,
        },
      };

      await cls.run(async () => {
        cls.set(ENTITY_MANAGER_KEY, manager);
        await repository.createOrder(dto);
      });

      await expect(
        manager.findOne(OrderEntity, {
          relations: {
            destination: { receiver: true },
            departure: { sender: true },
            requester: true,
            product: true,
            transportation: true,
          },
          where: { requester: user },
        }),
      ).resolves.toEqual(result);
    });
  });

  describe('findAllCreatedOrDeliveredOrderDetailByOrderIds', () => {
    beforeEach(async () => {
      const requester1 = await createUser(manager, {
        userId: '의뢰인 아이디',
        walletAddress: '의뢰인 지갑주소',
        contact: '01012341234',
      });
      const deliveryPerson1 = await createUser(manager, {
        userId: '배송원 아이디',
        walletAddress: '배송원 지갑주소',
        contact: '01066868684',
      });
      const requester2 = await createUser(manager, {
        userId: '의뢰인 아이디',
        walletAddress: '의뢰인 지갑주소',
        contact: '01054832876',
      });
      const deliveryPerson2 = await createUser(manager, {
        userId: '배송원 아이디',
        walletAddress: '배송원 지갑주소',
        contact: '01086544683',
      });

      await createOrder(manager, {
        requester: requester1,
        deliveryPerson: null,
        orderId: 1,
      });
      await createOrder(manager, {
        requester: requester2,
        deliveryPerson: null,
        orderId: 2,
      });
      await createOrder(manager, {
        requester: deliveryPerson1,
        deliveryPerson: null,
        orderId: 3,
      });
      await createOrder(manager, {
        requester: deliveryPerson2,
        deliveryPerson: null,
        orderId: 4,
      });
    });

    afterEach(async () => {
      await manager.clear(UserEntity);
      await manager.clear(OrderEntity);
    });

    test('통과하는 테스트', async () => {
      const orderIds = [2, 3];
      const result = [
        {
          id: 2,
          detail: '디테일',
          departure: {
            x: 0,
            y: 0,
            detail: '디테일',
            sender: {
              name: '이름',
              phone: '01012345678',
            },
          },
          destination: {
            x: 37.5,
            y: 112,
            detail: '디테일',
            receiver: {
              name: '이름',
              phone: '01012345678',
            },
          },
          product: {
            height: 0,
            length: 0,
            weight: 0,
            width: 0,
          },
        },
        {
          id: 3,
          detail: '디테일',
          departure: {
            x: 0,
            y: 0,
            detail: '디테일',
            sender: {
              name: '이름',
              phone: '01012345678',
            },
          },
          destination: {
            x: 37.5,
            y: 112,
            detail: '디테일',
            receiver: {
              name: '이름',
              phone: '01012345678',
            },
          },
          product: {
            height: 0,
            length: 0,
            weight: 0,
            width: 0,
          },
        },
      ];

      await cls.run(async () => {
        cls.set(ENTITY_MANAGER_KEY, manager);

        await expect(
          repository.findAllCreatedOrDeliveredOrderDetailByOrderIds(orderIds),
        ).resolves.toEqual(result);
      });
    });
  });

  describe('findAllMatchableOrderByWalletAddress', () => {
    const REQUESTER_WALLET_ADDRESS = '의뢰인 지갑주소';
    const DELIVERY_PERSON_1_WALLET_ADDRESS = '배송원1 지갑주소';
    const DELIVERY_PERSON_2_WALLET_ADDRESS = '배송원2 지갑주소';

    beforeEach(async () => {
      const requester = await createUser(manager, {
        userId: '의뢰인',
        walletAddress: REQUESTER_WALLET_ADDRESS,
        contact: '01012341324',
      });
      const deliveryPerson1 = await createUser(manager, {
        userId: '배송원1',
        walletAddress: DELIVERY_PERSON_1_WALLET_ADDRESS,
        contact: '01012340987',
      });
      const deliveryPerson2 = await createUser(manager, {
        userId: '배송원2',
        walletAddress: DELIVERY_PERSON_2_WALLET_ADDRESS,
        contact: '01009870987',
      });

      // 의뢰인이 주문 생성
      await createOrder(manager, {
        orderId: 1,
        requester,
        deliveryPerson: null,
      });

      // 배송원이 주문 생성
      await createOrder(manager, {
        orderId: 2,
        requester: deliveryPerson1,
        deliveryPerson: null,
      });

      // 의뢰인이 생성한 주문을 배송원이 수락
      await createOrder(manager, {
        orderId: 3,
        requester,
        deliveryPerson: deliveryPerson1,
      });

      // 의뢰인이 생성한 주문을 다른 배송원이 수락
      await createOrder(manager, {
        orderId: 4,
        requester,
        deliveryPerson: deliveryPerson2,
      });
    });

    afterEach(async () => {
      await manager.clear(UserEntity);
      await manager.clear(OrderEntity);
    });

    test('통과하는 테스트, 배송원이 수락한 주문과 생성한 주문은 조회되지 않음', async () => {
      const result = plainToInstance(MatchableOrderDto, [
        {
          id: 1,
          detail: '디테일',
          departure: { detail: '디테일', x: 0, y: 0 },
          destination: { detail: '디테일', x: 37.5, y: 112 },
          product: { height: 0, length: 0, weight: 0, width: 0 },
          transportation: {
            bicycle: 1,
            bike: 1,
            truck: 1,
          },
        },
        {
          id: 2,
          detail: '디테일',
          departure: { detail: '디테일', x: 0, y: 0 },
          destination: { detail: '디테일', x: 37.5, y: 112 },
          product: { height: 0, length: 0, weight: 0, width: 0 },
          transportation: {
            bicycle: 1,
            bike: 1,
            truck: 1,
          },
        },
      ]);

      await cls.run(async () => {
        cls.set(ENTITY_MANAGER_KEY, manager);

        await expect(
          repository.findAllMatchableOrderByWalletAddress(
            DELIVERY_PERSON_2_WALLET_ADDRESS,
          ),
        ).resolves.toEqual(result);
      });
    });

    test('실패하는 테스트, 존재하지 않는 배송원의 지갑주소를 입력하면 NotExistDataException을 던짐', async () => {
      const anotherDeliveryPersonWalletAddress =
        '존재하지 않는 배송원의 지갑주소';
      const error = new NotExistDataException(
        `${anotherDeliveryPersonWalletAddress}에 해당하는 사용자가 존재하지 않습니다.`,
      );

      await cls.run(async () => {
        cls.set(ENTITY_MANAGER_KEY, manager);

        await expect(
          repository.findAllMatchableOrderByWalletAddress(
            anotherDeliveryPersonWalletAddress,
          ),
        ).rejects.toStrictEqual(error);
      });
    });
  });

  describe('findRequesterIdByOrderId', () => {
    const USER_ID = '아이디';

    beforeEach(async () => {
      const user = await createUser(manager, {
        userId: USER_ID,
        walletAddress: '지갑주소',
        contact: '01012341234',
      });
      await createOrder(manager, {
        orderId: 1,
        requester: user,
        deliveryPerson: null,
      });
    });

    afterEach(async () => {
      await manager.clear(OrderEntity);
      await manager.clear(UserEntity);
    });

    test('통과하는 테스트', async () => {
      const orderId = 1;
      const result = {
        id: 1,
        requester: { id: '아이디' },
        deliveryPerson: null,
      };

      await cls.run(async () => {
        cls.set(ENTITY_MANAGER_KEY, manager);

        await expect(
          repository.findRequesterIdByOrderId(orderId),
        ).resolves.toEqual(result);
      });
    });
  });

  describe('updateDeliveryPersonAtOrder', () => {
    const DELIVERY_PERSON_WALLET_ADDRESS = '배송원 지갑 주소';
    const REQUESTER_WALLET_ADDRESS = '의뢰인 지갑 주소';

    beforeEach(async () => {
      const user = await createUser(manager, {
        userId: '의뢰인 아이디',
        walletAddress: REQUESTER_WALLET_ADDRESS,
        contact: '의뢰인 연락처',
      });
      await createOrder(manager, {
        requester: user,
        deliveryPerson: null,
        orderId: 1,
      });
      await createUser(manager, {
        userId: '배송원 아이디',
        walletAddress: '배송원 지갑 주소',
        contact: '배송원 연락처',
      });
    });

    afterEach(async () => {
      await manager.clear(OrderEntity);
      await manager.clear(UserEntity);
    });

    test('통과하는 테스트', async () => {
      const dto = {
        walletAddress: DELIVERY_PERSON_WALLET_ADDRESS,
        orderId: 1,
      };
      const result = {
        id: 1,
        detail: '디테일',
        deliveryPerson: {
          contact: '배송원 연락처',
          email: '이메일',
          id: '배송원 아이디',
          name: '이름',
          walletAddress: '배송원 지갑 주소',
        },
        requester: {
          contact: '의뢰인 연락처',
          email: '이메일',
          id: '의뢰인 아이디',
          name: '이름',
          walletAddress: '의뢰인 지갑 주소',
        },
      };

      await cls.run(async () => {
        cls.set(ENTITY_MANAGER_KEY, manager);

        await repository.updateDeliveryPersonAtOrder(dto);
      });

      await expect(
        manager.findOne(OrderEntity, {
          relations: {
            requester: true,
            deliveryPerson: true,
          },
          where: { id: 1 },
        }),
      ).resolves.toEqual(result);
    });

    test('실패하는 테스트, 존재하지 않는 배송원의 지갑주소를 입력하면 NotExistDataException을 던짐', async () => {
      const dto = {
        orderId: 1,
        walletAddress: '존재하지 않는 지갑주소',
      };
      const error = new NotExistDataException(
        '존재하지 않는 지갑주소 에 대응되는 사용자가 존재하지 않습니다.',
      );

      await cls.run(async () => {
        cls.set(ENTITY_MANAGER_KEY, manager);

        await expect(
          repository.updateDeliveryPersonAtOrder(dto),
        ).rejects.toStrictEqual(error);
      });
    });

    test('실패하는 테스트, 존재하지 않는 주문 아이디를 입력하면 NotExistDataException을 던짐', async () => {
      const dto = {
        walletAddress: DELIVERY_PERSON_WALLET_ADDRESS,
        orderId: 2,
      };
      const error = new NotExistDataException(
        '2 에 대응되는 주문이 존재하지 않습니다.',
      );

      await cls.run(async () => {
        cls.set(ENTITY_MANAGER_KEY, manager);

        await expect(
          repository.updateDeliveryPersonAtOrder(dto),
        ).rejects.toStrictEqual(error);
      });
    });

    test('실패하는 테스트, 주문 요청자와 배송원의 지갑주소가 동일하면 BusinessRuleConflictDataException을 던짐', async () => {
      const walletAddress = '의뢰인 지갑 주소';
      const orderId = 1;
      const dto = {
        walletAddress,
        orderId,
      };
      const error = new BusinessRuleConflictDataException(
        `${walletAddress}가 의뢰인의 지갑주소와 동일합니다.`,
      );

      await cls.run(async () => {
        cls.set(ENTITY_MANAGER_KEY, manager);

        await expect(
          repository.updateDeliveryPersonAtOrder(dto),
        ).rejects.toStrictEqual(error);
      });
    });
  });

  describe('deleteByOrderId', () => {
    beforeEach(async () => {
      const requester = await createUser(manager, {
        userId: '아이디',
        walletAddress: '요청자 지갑주소',
        contact: '01012341234',
      });
      await createOrder(manager, {
        requester,
        deliveryPerson: null,
        orderId: 1,
      });
    });

    afterEach(async () => {
      await manager.clear(OrderEntity);
    });

    test('통과하는 테스트', async () => {
      await expect(manager.exists(OrderEntity)).resolves.toBe(true);

      const orderId = 1;

      await cls.run(async () => {
        cls.set(ENTITY_MANAGER_KEY, manager);

        await repository.deleteByOrderId(orderId);
      });

      await expect(manager.exists(OrderEntity)).resolves.toBe(false);
    });
  });
});

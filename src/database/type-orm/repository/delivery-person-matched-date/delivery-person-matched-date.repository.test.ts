import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule, getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  DeliveryPersonMatchedDate,
  Departure,
  Destination,
  Order,
  Product,
  Transportation,
  User,
} from '../../entity';
import { TestTypeormModule } from '../../test-typeorm.module';
import { DuplicatedDataError } from '../../util';
import { DeliveryPersonMatchedDateRepository } from './delivery-person-matched-date-repository';

const createUser = async (
  repository: Repository<unknown>,
  {
    userId,
    walletAddress,
    contact,
  }: { userId: string; walletAddress: string; contact: string },
) => {
  const user = repository.manager.create(User, {
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

  return await repository.manager.save(User, user);
};

const createOrder = async (
  repository: Repository<unknown>,
  {
    requester,
    deliveryPerson,
    orderId,
  }: { requester: User; deliveryPerson: User | null; orderId: number },
) => {
  await orderRepository.manager.transaction(async (manager) => {
    const order = manager.create(Order, {
      id: orderId,
      requester,
      deliveryPerson,
      detail: '디테일',
    });

    await manager.save(order);

    const id = orderId;

    const product = manager.create(Product, {
      id,
      width: 0,
      length: 0,
      height: 0,
      weight: 0,
      order,
    });

    const transportation = manager.create(Transportation, {
      id,
      walking: 0,
      bicycle: 0,
      scooter: 0,
      bike: 0,
      car: 0,
      truck: 0,
      order,
    });

    const destination = manager.create(Destination, {
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

    const departure = manager.create(Departure, {
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
      manager.save(Product, product),
      manager.save(Transportation, transportation),
      manager.save(Destination, destination),
      manager.save(Departure, departure),
    ]);

    return id;
  });
};

let testModule: TestingModule;
let repository: DeliveryPersonMatchedDateRepository;
let orderRepository: Repository<Order>;

beforeAll(async () => {
  testModule = await Test.createTestingModule({
    imports: [
      TestTypeormModule,
      TypeOrmModule.forFeature([DeliveryPersonMatchedDate]),
    ],
    providers: [DeliveryPersonMatchedDateRepository],
  }).compile();

  repository = testModule.get(DeliveryPersonMatchedDateRepository);
  orderRepository = testModule.get(
    getRepositoryToken(DeliveryPersonMatchedDate),
  );
});

afterEach(async () => {
  await orderRepository.manager.clear(User);
  await orderRepository.manager.clear(Order);
  await orderRepository.manager.clear(DeliveryPersonMatchedDate);
});

describe('DeliveryPersonMatchedDateRepository', () => {
  describe('create()', () => {
    beforeEach(async () => {
      const requester = await createUser(orderRepository, {
        userId: '아이디',
        walletAddress: '지갑주소',
        contact: '01012341234',
      });

      await createOrder(orderRepository, {
        requester,
        deliveryPerson: null,
        orderId: 1,
      });
    });

    test('통과하는 테스트', async () => {
      const orderId = 1;

      await repository.create(orderRepository.manager, orderId);

      const order = await orderRepository.manager.findOneBy(
        DeliveryPersonMatchedDate,
        { id: orderId },
      );

      expect(order?.id).toBe(orderId);
      expect(order?.date).not.toBeFalsy();
    });

    test('실패하는 테스트, 중복인 데이터', async () => {
      const orderId = 1;

      try {
        await repository.create(orderRepository.manager, orderId);

        await expect(
          repository.create(orderRepository.manager, orderId),
        ).rejects.toStrictEqual(
          new DuplicatedDataError('1에 대해 중복된 데이터가 존재합니다.'),
        );
      } catch (error) {
        console.error(error);
      }
    });
  });

  describe('findAllOrderIdByBetweenDates()', () => {
    const START_DATE = new Date(2000, 0, 1, 0, 0, 0, 0);
    const END_DATE = new Date(2000, 0, 31, 23, 59, 59, 999);

    beforeEach(async () => {
      const requester = await createUser(orderRepository, {
        userId: '아이디',
        walletAddress: '지갑주소',
        contact: '01012341234',
      });

      const deliveryPerson = await createUser(orderRepository, {
        userId: '배송원 아이디',
        walletAddress: '배송원 지갑주소',
        contact: '01009870987',
      });

      await createOrder(orderRepository, {
        requester,
        deliveryPerson,
        orderId: 1,
      });
      await createOrder(orderRepository, {
        requester,
        deliveryPerson,
        orderId: 2,
      });
      await createOrder(orderRepository, {
        requester,
        deliveryPerson,
        orderId: 3,
      });
      await createOrder(orderRepository, {
        requester,
        deliveryPerson,
        orderId: 4,
      });

      await orderRepository.manager.save(DeliveryPersonMatchedDate, [
        { id: 1, date: new Date(2000, 0, 0, 23, 59, 59, 999) },
        { id: 2, date: START_DATE },
        { id: 3, date: END_DATE },
        { id: 4, date: new Date(2000, 1, 1, 0, 0, 0, 0) },
      ]);
    });

    describe('findAllOrderIdByBetweenDates 테스트', () => {
      test('통과하는 테스트', async () => {
        await expect(
          repository.findAllOrderIdByBetweenDates(START_DATE, END_DATE),
        ).resolves.toEqual([{ id: 2 }, { id: 3 }]);
      });
    });
  });
});

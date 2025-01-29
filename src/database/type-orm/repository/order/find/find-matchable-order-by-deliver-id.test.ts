import { expect } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import {
  Departure,
  Destination,
  Order,
  Product,
  Transportation,
  User,
} from '@src/database/type-orm/entity';
import { TestTypeormModule } from '@src/database/type-orm/test-typeorm.module';
import { NotExistDataError } from '@src/database/type-orm/util';
import { Repository } from 'typeorm';
import { OrderRepository } from '../order.repository';

const createUser = async (
  repository: Repository<Order>,
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
  repository: Repository<Order>,
  requester: User,
  deliveryPerson: User | null,
) => {
  await repository.manager.transaction(async (manager) => {
    const order = manager.create(Order, {
      requester,
      deliveryPerson,
      detail: '디테일',
    });

    await manager.save(order);

    const id = order.id;

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
      recipient: {
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
let repository: OrderRepository;
let orderRepository: Repository<Order>;

beforeAll(async () => {
  testModule = await Test.createTestingModule({
    imports: [
      TestTypeormModule,
      TypeOrmModule.forFeature([
        Order,
        User,
        Product,
        Transportation,
        Destination,
        Departure,
      ]),
    ],
    providers: [OrderRepository],
  }).compile();

  repository = testModule.get(OrderRepository);
  orderRepository = testModule.get(getRepositoryToken(Order));
});

beforeAll(async () => {
  const requester = await createUser(orderRepository, {
    userId: '의뢰인',
    walletAddress: '의뢰인 지갑주소',
    contact: '01012341324',
  });
  const deliveryPerson1 = await createUser(orderRepository, {
    userId: '배송원1',
    walletAddress: '배송원1 지갑주소',
    contact: '01012340987',
  });
  const deliveryPerson2 = await createUser(orderRepository, {
    userId: '배송원2',
    walletAddress: '배송원2 지갑주소',
    contact: '01009870987',
  });

  // 의뢰인이 주문 생성
  await createOrder(orderRepository, requester, null);

  // 배송원이 주문 생성
  await createOrder(orderRepository, deliveryPerson1, null);

  // 의뢰인이 생성한 주문을 배송원이 수락
  await createOrder(orderRepository, requester, deliveryPerson1);

  // 의뢰인이 생성한 주문을 다른 배송원이 수락
  await createOrder(orderRepository, requester, deliveryPerson2);
});

describe('findMatchableOrderByDeliverId 테스트', () => {
  describe('통과하는 테스트', () => {
    test('배송원이 수락한 주문과 생성한 주문은 조회되지 않음', async () => {
      await expect(
        repository.findAllMatchableOrderByWalletAddress('배송원1 지갑주소'),
      ).resolves.toEqual([
        {
          id: 1,
          departure: { detail: '디테일', x: 0, y: 0 },
          destination: { detail: '디테일', x: 37.5, y: 112 },
          detail: '디테일',
          product: { height: 0, length: 0, weight: 0, width: 0 },
          transportation: {
            bicycle: 0,
            bike: 0,
            car: 0,
            scooter: 0,
            truck: 0,
            walking: 0,
          },
        },
      ]);
    });
  });

  describe('실패하는 테스트', () => {
    test('배송원이 DB에 존재하지 않는 경우', async () => {
      const walletAddress = '배송원3 지갑주소';

      await expect(
        repository.findAllMatchableOrderByWalletAddress(walletAddress),
      ).rejects.toStrictEqual(
        new NotExistDataError(
          `${walletAddress}에 해당하는 사용자가 존재하지 않습니다.`,
        ),
      );
    });
  });
});

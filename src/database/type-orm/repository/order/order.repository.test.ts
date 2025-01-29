import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule, getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  Departure,
  Destination,
  Order,
  Product,
  Transportation,
  User,
} from '../../entity';
import { TestTypeormModule } from '../../test-typeorm.module';
import { BusinessRuleConflictDataError, NotExistDataError } from '../../util';
import { OrderRepository } from './order.repository';

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
  {
    requester,
    deliveryPerson,
    orderId,
  }: { requester: User; deliveryPerson: User | null; orderId: number },
) => {
  await repository.manager.transaction(async (manager) => {
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

describe('orderRepository 테스트', () => {
  describe('updateDeliver 테스트', () => {
    beforeAll(async () => {
      const user = await createUser(orderRepository, {
        userId: '의뢰인 아이디',
        walletAddress: '의뢰인 지갑 주소',
        contact: '의뢰인 연락처',
      });
      await createOrder(orderRepository, {
        requester: user,
        deliveryPerson: null,
        orderId: 1,
      });
    });

    afterAll(async () => {
      await orderRepository.manager.clear(User);
    });

    test('통과하는 테스트', async () => {
      const deliveryPerson = await createUser(orderRepository, {
        userId: '배송원 아이디',
        walletAddress: '배송원 지갑 주소',
        contact: '배송원 연락처',
      });

      await repository.updateDeliveryPersonAtOrder(orderRepository.manager, {
        walletAddress: deliveryPerson.walletAddress,
        orderId: 1,
      });

      const order = await orderRepository.manager.findOne(Order, {
        relations: {
          requester: true,
          deliveryPerson: true,
        },
        where: { id: 1 },
      });

      expect(order).toEqual({
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
      });
    });

    test('실패하는 테스트, 존재하지 않는 배송원', async () => {
      await expect(
        repository.updateDeliveryPersonAtOrder(orderRepository.manager, {
          walletAddress: '존재하지 않는 지갑주소',
          orderId: 1,
        }),
      ).rejects.toStrictEqual(
        new NotExistDataError(
          '존재하지 않는 지갑주소 에 대응되는 사용자가 존재하지 않습니다.',
        ),
      );
    });

    test('실패하는 테스트, 존재하지 않는 주문', async () => {
      const deliveryPerson = orderRepository.manager.create(User, {
        id: '배송원 아이디',
        walletAddress: '배송원 지갑 주소',
        name: '배송원 이름',
        email: '베송원 이메일',
        contact: '배송원 연락처',
      });

      await orderRepository.manager.save(User, deliveryPerson);

      await expect(
        repository.updateDeliveryPersonAtOrder(orderRepository.manager, {
          walletAddress: deliveryPerson.walletAddress,
          orderId: 2,
        }),
      ).rejects.toStrictEqual(
        new NotExistDataError('2 에 대응되는 주문이 존재하지 않습니다.'),
      );
    });

    test('실패하는 테스트, 배송원과 요청한 사람이 동일함', async () => {
      const walletAddress = '의뢰인 지갑 주소';
      const orderId = 1;

      await expect(
        repository.updateDeliveryPersonAtOrder(orderRepository.manager, {
          walletAddress,
          orderId,
        }),
      ).rejects.toStrictEqual(
        new BusinessRuleConflictDataError(
          `${walletAddress}가 의뢰인의 지갑주소와 동일합니다.`,
        ),
      );
    });
  });

  describe('findAllCreatedOrDeliveredOrderDetailByOrderIds()', () => {
    beforeAll(async () => {
      const requester1 = await createUser(orderRepository, {
        userId: '의뢰인 아이디',
        walletAddress: '의뢰인 지갑주소',
        contact: '01012341234',
      });
      const deliveryPerson1 = await createUser(orderRepository, {
        userId: '배송원 아이디',
        walletAddress: '배송원 지갑주소',
        contact: '01066868684',
      });
      const requester2 = await createUser(orderRepository, {
        userId: '의뢰인 아이디',
        walletAddress: '의뢰인 지갑주소',
        contact: '01054832876',
      });
      const deliveryPerson2 = await createUser(orderRepository, {
        userId: '배송원 아이디',
        walletAddress: '배송원 지갑주소',
        contact: '01086544683',
      });

      await createOrder(orderRepository, {
        requester: requester1,
        deliveryPerson: null,
        orderId: 1,
      });
      await createOrder(orderRepository, {
        requester: requester2,
        deliveryPerson: null,
        orderId: 2,
      });
      await createOrder(orderRepository, {
        requester: deliveryPerson1,
        deliveryPerson: null,
        orderId: 3,
      });
      await createOrder(orderRepository, {
        requester: deliveryPerson2,
        deliveryPerson: null,
        orderId: 4,
      });
    });

    test('통과하는 테스트', async () => {
      await expect(
        repository.findAllCreatedOrDeliveredOrderDetailByOrderIds([2, 3]),
      ).resolves.toEqual([
        {
          departure: {
            detail: '디테일',
            sender: {
              name: '이름',
              phone: '01012345678',
            },
            x: 0,
            y: 0,
          },
          destination: {
            detail: '디테일',
            receiver: {
              name: '이름',
              phone: '01012345678',
            },
            x: 37.5,
            y: 112,
          },
          detail: '디테일',
          id: 2,
          product: {
            height: 0,
            length: 0,
            weight: 0,
            width: 0,
          },
        },
        {
          departure: {
            detail: '디테일',
            sender: {
              name: '이름',
              phone: '01012345678',
            },
            x: 0,
            y: 0,
          },
          destination: {
            detail: '디테일',
            receiver: {
              name: '이름',
              phone: '01012345678',
            },
            x: 37.5,
            y: 112,
          },
          detail: '디테일',
          id: 3,
          product: {
            height: 0,
            length: 0,
            weight: 0,
            width: 0,
          },
        },
      ]);
    });
  });
});

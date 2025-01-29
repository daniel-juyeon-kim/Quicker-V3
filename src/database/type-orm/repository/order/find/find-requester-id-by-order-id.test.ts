import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule, getRepositoryToken } from '@nestjs/typeorm';
import {
  Departure,
  Destination,
  Order,
  Product,
  Transportation,
  User,
} from '@src/database/type-orm/entity';
import { TestTypeormModule } from '@src/database/type-orm/test-typeorm.module';
import { Repository } from 'typeorm';
import { OrderRepository } from '../order.repository';

const createUser = async (repository: Repository<Order>) => {
  const userId = '아이디';

  const user = repository.manager.create(User, {
    id: userId,
    walletAddress: '지갑주소',
    name: '이름',
    email: '이메일',
    contact: '연락처',
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

  await repository.manager.save(User, user);
};

const createOrder = async (dataSource: Repository<Order>, requester: User) => {
  const order = dataSource.manager.create(Order, {
    requester,
    detail: '디테일',
  });

  await dataSource.manager.save(Order, order);

  const id = order.id;

  const product = dataSource.manager.create(Product, {
    id,
    width: 0,
    length: 0,
    height: 0,
    weight: 0,
    order,
  });

  const transportation = dataSource.manager.create(Transportation, {
    id,
    walking: 0,
    bicycle: 0,
    scooter: 0,
    bike: 0,
    car: 0,
    truck: 0,
    order,
  });

  const destination = dataSource.manager.create(Destination, {
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

  const departure = dataSource.manager.create(Departure, {
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

  await dataSource.manager.save(Product, product);
  await dataSource.manager.save(Transportation, transportation);
  await dataSource.manager.save(Destination, destination);
  await dataSource.manager.save(Departure, departure);
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
  await createUser(orderRepository);
});

beforeEach(async () => {
  const user = (await orderRepository.manager.findOneBy(User, {
    id: '아이디',
  })) as User;
  await createOrder(orderRepository, user);
});

afterEach(async () => {
  await orderRepository.manager.clear(Order);
});

describe('orderRepository 테스트', () => {
  test('findRequesterIdByOrderId 테스트', async () => {
    const orderId = 1;

    await expect(repository.findRequesterIdByOrderId(orderId)).resolves.toEqual(
      {
        id: 1,
        requester: { id: '아이디' },
        deliveryPerson: null,
      },
    );
  });
});

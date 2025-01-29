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
import { OrderRepository } from './order.repository';

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

  await createUser(orderRepository);
});

afterEach(async () => {
  await orderRepository.manager.clear(Order);
});

describe('orderRepository 테스트', () => {
  test('create 테스트', async () => {
    const walletAddress = '지갑주소';
    const detail = '디테일';
    const product = {
      width: 0,
      length: 0,
      height: 0,
      weight: 0,
    };
    const transportation = {
      walking: 0,
      bicycle: 0,
      scooter: 0,
      bike: 0,
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

    await repository.create({
      walletAddress,
      detail,
      receiver,
      destination,
      sender,
      departure,
      product,
      transportation,
    });

    const user = (await orderRepository.manager.findOneBy(User, {
      id: '아이디',
    })) as User;

    const order = await orderRepository.manager.findOne(Order, {
      relations: {
        destination: { receiver: true },
        departure: { sender: true },
        requester: true,
        product: true,
        transportation: true,
      },
      where: { requester: user },
    });

    expect(order).toEqual({
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
      transportation: { id: 1, ...transportation },
    });
  });
});

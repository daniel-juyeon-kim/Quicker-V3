import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule, getRepositoryToken } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import {
  Departure,
  Destination,
  Order,
  Product,
  Transportation,
  User,
} from '../../entity';
import { TestTypeormModule } from '../../test-typeorm.module';
import { OrderParticipantRepository } from './chat-room.repository';

const createUser = async (manager: EntityManager) => {
  const user = manager.create(User, {
    id: '아이디',
    walletAddress: '지갑주소',
    name: '이름',
    email: '이메일',
    contact: '연락처',
    birthDate: {
      id: '아이디',
      date: new Date(2000, 9, 12).toISOString(),
    },
    profileImage: {
      id: '아이디',
      imageId: '111',
    },
    joinDate: {
      id: '아이디',
      date: new Date(2023, 9, 12).toISOString(),
    },
  });

  await manager.save(User, user);
};

const createOrder = async (manager: EntityManager, requester: User) => {
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
  };
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

  await manager.transaction(async (manager) => {
    const order = manager.create(Order, {
      detail,
      requester,
    });

    await manager.save(Order, order);

    const id = order.id;

    await manager.save(Product, {
      id,
      ...product,
      order: order,
    });
    await manager.save(Transportation, {
      id,
      ...transportation,
      order: order,
    });
    await manager.save(Destination, {
      id,
      ...destination,
      order: order,
      receiver: {
        id,
        ...receiver,
      },
    });
    await manager.save(Departure, {
      id,
      ...departure,
      order: order,
      sender: {
        id,
        ...sender,
      },
    });
  });
};

let testModule: TestingModule;
let repository: OrderParticipantRepository;
let ormRepository: Repository<Order>;

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
    providers: [OrderParticipantRepository],
  }).compile();

  repository = testModule.get(OrderParticipantRepository);
  ormRepository = testModule.get(getRepositoryToken(Order));

  await createUser(ormRepository.manager);
});

beforeEach(async () => {
  const user = (await ormRepository.manager.findOneBy(User, {
    id: '아이디',
  })) as User;
  await createOrder(ormRepository.manager, user);
});

afterEach(async () => {
  await ormRepository.manager.clear(Order);
});

describe('findChatParticipantByOrderId 테스트', () => {
  test('통과하는 테스트', async () => {
    const orderId = 1;

    await expect(
      repository.findSenderReceiverInfoByOrderId(orderId),
    ).resolves.toEqual({
      id: orderId,
      departure: {
        id: orderId,
        x: 0,
        y: 0,
        sender: { phone: '01012345678' },
      },
      destination: {
        id: orderId,
        x: 37.5,
        y: 112,
        receiver: { phone: '01012345678' },
      },
    });
  });

  test('실패하는 테스트, 존재하지 않는 주문 아이디 입력', async () => {
    await expect(
      repository.findSenderReceiverInfoByOrderId(32),
    ).rejects.toThrow('데이터가 존재하지 않습니다.');
  });
});

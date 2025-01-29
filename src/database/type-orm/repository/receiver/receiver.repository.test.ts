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
import { ReceiverRepository } from './receiver.repository';

let testModule: TestingModule;
let repository: ReceiverRepository;
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
    providers: [ReceiverRepository],
  }).compile();

  repository = testModule.get(ReceiverRepository);
  ormRepository = testModule.get(getRepositoryToken(Order));
});

const createUser = async (manager: EntityManager) => {
  const id = '아이디';

  const user = manager.create(User, {
    id,
    walletAddress: '지갑주소',
    name: '이름',
    email: '이메일',
    contact: '연락처',
    birthDate: {
      id,
      date: new Date(2000, 9, 12).toISOString(),
    },
    joinDate: {
      id,
      date: new Date(2023, 9, 12).toISOString(),
    },
    profileImage: {
      id,
      imageId: '400',
    },
  });

  await manager.save(user);
};

const createOrder = async (manager: EntityManager, requester: User) => {
  await manager.transaction(async (manager) => {
    const order = manager.create(Order, {
      requester,
      detail: '디테일',
    });

    await manager.save(Order, order);

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
  });
};

beforeEach(async () => {
  await createUser(ormRepository.manager);
  const user = (await ormRepository.manager.findOne(User, {
    where: { id: '아이디' },
  })) as User;
  await createOrder(ormRepository.manager, user);
});

afterEach(async () => {
  await Promise.allSettled([
    ormRepository.manager.clear(User),
    ormRepository.manager.clear(Order),
  ]);
});

describe('findPhoneNumberByOrderId 테스트', () => {
  test('통과하는 테스트', async () => {
    const orderId = 1;

    await expect(
      repository.findPhoneNumberByOrderId(ormRepository.manager, orderId),
    ).resolves.toEqual({
      id: orderId,
      phone: '01012345678',
    });
  });

  test('실패하는 테스트, 존재하지 않는 값 입력', async () => {
    await expect(
      repository.findPhoneNumberByOrderId(ormRepository.manager, 32),
    ).rejects.toThrow('데이터가 존재하지 않습니다.');
  });
});

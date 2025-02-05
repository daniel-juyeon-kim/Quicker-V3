import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule, getRepositoryToken } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { TestTypeormModule } from '../../../../../test/config/typeorm.module';
import {
  DepartureEntity,
  DestinationEntity,
  OrderEntity,
  ProductEntity,
  TransportationEntity,
  UserEntity,
} from '../../entity';
import { NotExistDataError } from '../../util';
import { ReceiverRepository } from './receiver.repository';

const createUser = async (manager: EntityManager) => {
  const id = '아이디';

  const user = manager.create(UserEntity, {
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

const createOrder = async (manager: EntityManager, requester: UserEntity) => {
  await manager.transaction(async (manager) => {
    const order = manager.create(OrderEntity, {
      requester,
      detail: '디테일',
    });

    await manager.save(OrderEntity, order);

    const id = order.id;

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
      bicycle: 0,
      scooter: 0,
      bike: 0,
      car: 0,
      truck: 0,
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
  });
};

describe('ReceiverRepository', () => {
  let testModule: TestingModule;
  let repository: ReceiverRepository;
  let ormRepository: Repository<OrderEntity>;
  let manager: EntityManager;

  beforeAll(async () => {
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
        ]),
      ],
      providers: [ReceiverRepository],
    }).compile();

    repository = testModule.get(ReceiverRepository);
    ormRepository = testModule.get(getRepositoryToken(OrderEntity));
    manager = ormRepository.manager;
  });

  beforeEach(async () => {
    await createUser(manager);
    const user = await manager.findOne(UserEntity, {
      where: { id: '아이디' },
    });
    await createOrder(manager, user);
  });

  afterEach(async () => {
    await Promise.allSettled([
      manager.clear(UserEntity),
      manager.clear(OrderEntity),
    ]);
  });

  describe('findPhoneNumberByOrderId 테스트', () => {
    test('통과하는 테스트', async () => {
      const orderId = 1;
      const result = {
        id: orderId,
        phone: '01012345678',
      };

      await expect(
        repository.findPhoneNumberByOrderId(manager, orderId),
      ).resolves.toEqual(result);
    });

    test('실패하는 테스트, 존재하지 않는 값 입력', async () => {
      const orderId = 32;
      const error = new NotExistDataError(
        `${orderId}에 해당되는 데이터가 존재하지 않습니다.`,
      );

      await expect(
        repository.findPhoneNumberByOrderId(manager, orderId),
      ).rejects.toStrictEqual(error);
    });
  });
});

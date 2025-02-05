import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { UnknownDataBaseError } from '@src/core';
import {
  BirthDateEntity,
  DepartureEntity,
  DestinationEntity,
  JoinDateEntity,
  OrderEntity,
  ProductEntity,
  ProfileImageEntity,
  ReceiverEntity,
  SenderEntity,
  TransportationEntity,
  UserEntity,
} from '@src/database/type-orm/entity';
import { mock } from 'jest-mock-extended';
import { EntityManager, Repository } from 'typeorm';
import { TestTypeormModule } from '../../../../../test/config/typeorm.module';
import { NotExistDataError } from '../../util';
import { LocationRepository } from './location.repository';

const createUser = async (manager: EntityManager) => {
  const id = '아이디';
  const user = {
    id,
    walletAddress: '지갑주소',
    name: '이름',
    email: '이메일',
    contact: '연락처',
  };

  const birthDate = {
    id,
    date: new Date(2000, 9, 12).toISOString(),
  };

  const profileImage = {
    id,
    imageId: '111',
  };

  const joinDate = {
    id,
    date: new Date(2023, 9, 12).toISOString(),
  };

  await manager.transaction(async (manager) => {
    await manager.insert(UserEntity, user);
    await manager.insert(BirthDateEntity, birthDate);
    await manager.insert(ProfileImageEntity, profileImage);
    await manager.insert(JoinDateEntity, joinDate);
  });

  return await manager.findOneBy(UserEntity, {
    id: '아이디',
  });
};

const createOrder = async (manager: EntityManager, requester: UserEntity) => {
  const detail = '디테일';
  const product = {
    width: 0,
    length: 0,
    height: 0,
    weight: 0,
  };
  const transportation: Partial<TransportationEntity> = {
    walking: 0,
    bicycle: 0,
    scooter: 0,
    bike: 0,
    car: 0,
    truck: 0,
  };
  const receiver = {
    name: '이름',
    phone: '01012345678',
  };
  const destination = {
    x: 127.8494,
    y: 37.5,
    detail: '디테일',
  };
  const departure = {
    x: 127.09,
    y: 37.527,
    detail: '디테일',
  };
  const sender = {
    name: '이름',
    phone: '01012345678',
  };

  await manager.transaction(async (manager) => {
    const order = manager.create(OrderEntity, {
      detail,
      requester,
    });

    await manager.insert(OrderEntity, order);

    const id = order.id;

    await manager.insert(ProductEntity, {
      id,
      ...product,
    });
    await manager.insert(TransportationEntity, {
      id,
      ...transportation,
    });
    await manager.insert(DestinationEntity, {
      id,
      ...destination,
    });
    await manager.insert(ReceiverEntity, {
      id,
      ...receiver,
    });
    await manager.insert(DepartureEntity, {
      id,
      ...departure,
    });
    await manager.insert(SenderEntity, {
      id,
      ...sender,
    });
  });
};

describe('LocationRepository', () => {
  let testModule: TestingModule;
  let repository: LocationRepository;
  let ormRepository: Repository<OrderEntity>;
  let manager: EntityManager;

  beforeAll(async () => {
    testModule = await Test.createTestingModule({
      imports: [TestTypeormModule, TypeOrmModule.forFeature([OrderEntity])],
      providers: [LocationRepository],
    }).compile();

    repository = testModule.get<LocationRepository>(LocationRepository);
    ormRepository = testModule.get<Repository<OrderEntity>>(
      getRepositoryToken(OrderEntity),
    );
    manager = ormRepository.manager;
  });

  beforeAll(async () => {
    const user = await createUser(manager);
    await createOrder(manager, user);
    await createOrder(manager, user);
  });

  afterAll(async () => {
    await testModule.close();
  });

  describe('findDestinationDepartureByOrderId()', () => {
    test('통과하는 테스트', async () => {
      const orderId = 1;
      const result = {
        id: orderId,
        departure: { x: 127.09, y: 37.527 },
        destination: { x: 127.8494, y: 37.5 },
      };

      await expect(
        repository.findDestinationDepartureByOrderId(orderId),
      ).resolves.toEqual(result);
    });

    describe('실패하는 테스트', () => {
      test('존재하지 않는 값 저장, NotExistDataError를 던짐', async () => {
        const orderId = 32;
        const error = new NotExistDataError(
          `${orderId}에 대한 데이터가 존재하지 않습니다.`,
        );

        await expect(
          repository.findDestinationDepartureByOrderId(orderId),
        ).rejects.toEqual(error);
      });

      test('예측하지 못한 에러, unknownError를 던짐', async () => {
        const orderId = 1;
        const originalError = new Error('알 수 없는 에러');
        const error = new UnknownDataBaseError(originalError);
        const ormRepository = mock<Repository<OrderEntity>>();
        const repository = new LocationRepository(ormRepository);

        ormRepository.findOne.mockRejectedValue(originalError);

        await expect(
          repository.findDestinationDepartureByOrderId(orderId),
        ).rejects.toStrictEqual(error);
      });
    });
  });

  describe('findAllDestinationDepartureByOrderId()', () => {
    test('통과하는 테스트', async () => {
      const orderIds = [1, 2];
      const result = [
        {
          id: 1,
          departure: { x: 127.09, y: 37.527 },
          destination: { x: 127.8494, y: 37.5 },
        },
        {
          id: 2,
          departure: { x: 127.09, y: 37.527 },
          destination: { x: 127.8494, y: 37.5 },
        },
      ];

      await expect(
        repository.findAllDestinationDepartureByOrderId(orderIds),
      ).resolves.toEqual(result);
    });

    describe('실패하는 테스트', () => {
      test('존재하는 값과 존재하지 않는 값이 섞임', async () => {
        const orderIds = [2, 3];
        const result = [
          {
            id: 2,
            departure: { x: 127.09, y: 37.527 },
            destination: { x: 127.8494, y: 37.5 },
          },
        ];

        await expect(
          repository.findAllDestinationDepartureByOrderId(orderIds),
        ).resolves.toEqual(result);
      });

      test('존재하지 않는 값 입력, 빈 배열 반환', async () => {
        const orderIds = [3, 4];
        const result = [];

        await expect(
          repository.findAllDestinationDepartureByOrderId(orderIds),
        ).resolves.toEqual(result);
      });
    });
  });
});

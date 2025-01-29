import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { UnknownDataBaseError } from '@src/core';
import {
  BirthDate,
  Departure,
  Destination,
  JoinDate,
  Order,
  Product,
  ProfileImage,
  Receiver,
  Sender,
  Transportation,
  User,
} from '@src/database/type-orm/entity';
import { TestTypeormModule } from '@src/database/type-orm/test-typeorm.module';
import { mock } from 'jest-mock-extended';
import { Repository } from 'typeorm';
import { LocationRepository } from './location.repository';

describe('LocationRepository', () => {
  let testModule: TestingModule;
  let repository: LocationRepository;
  let orderRepository: Repository<Order>;

  beforeAll(async () => {
    testModule = await Test.createTestingModule({
      imports: [TestTypeormModule, TypeOrmModule.forFeature([Order])],
      providers: [LocationRepository],
    }).compile();

    repository = testModule.get<LocationRepository>(LocationRepository);
    orderRepository = testModule.get<Repository<Order>>(
      getRepositoryToken(Order),
    );
  });

  beforeAll(async () => {
    const user = await createUser();
    await createOrder(user);
    await createOrder(user);
  });

  afterAll(async () => {
    await testModule.close();
  });

  const createUser = async () => {
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

    await orderRepository.manager.transaction(async (manager) => {
      await manager.insert(User, user);
      await manager.insert(BirthDate, birthDate);
      await manager.insert(ProfileImage, profileImage);
      await manager.insert(JoinDate, joinDate);
    });

    return (await orderRepository.manager.findOneBy(User, {
      id: '아이디',
    })) as User;
  };

  const createOrder = async (requester: User) => {
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

    await orderRepository.manager.transaction(async (manager) => {
      const order = manager.create(Order, {
        detail,
        requester,
      });

      await manager.insert(Order, order);

      const id = order.id;

      await manager.insert(Product, {
        id,
        ...product,
      });
      await manager.insert(Transportation, {
        id,
        ...transportation,
      });
      await manager.insert(Destination, {
        id,
        ...destination,
      });
      await manager.insert(Receiver, {
        id,
        ...receiver,
      });
      await manager.insert(Departure, {
        id,
        ...departure,
      });
      await manager.insert(Sender, {
        id,
        ...sender,
      });
    });
  };

  describe('findDestinationDepartureByOrderId()', () => {
    test('통과하는 테스트', async () => {
      const orderId = 1;

      await expect(
        repository.findDestinationDepartureByOrderId(orderId),
      ).resolves.toEqual({
        id: orderId,
        departure: { x: 127.09, y: 37.527 },
        destination: { x: 127.8494, y: 37.5 },
      });
    });

    describe('실패하는 테스트', () => {
      test('존재하지 않는 값 입력', async () => {
        const orderId = 32;
        await expect(
          repository.findDestinationDepartureByOrderId(orderId),
        ).rejects.toThrow(`${orderId}에 대한 데이터가 존재하지 않습니다.`);
      });

      test('예측하지 못한 에러', async () => {
        const orderId = 1;
        const typeOrmRepository = mock<Repository<Order>>();
        const originalError = new Error('알 수 없는 에러');

        typeOrmRepository.findOne.mockRejectedValue(originalError);

        const repository = new LocationRepository(typeOrmRepository);

        try {
          await repository.findDestinationDepartureByOrderId(orderId);
        } catch (e) {
          const error = e as UnknownDataBaseError;
          expect(error).toBeInstanceOf(UnknownDataBaseError);
          expect(error.unknownError).toStrictEqual(originalError);
        }
      });
    });
  });

  describe('findAllDestinationDepartureByOrderId()', () => {
    test('통과하는 테스트', async () => {
      await expect(
        repository.findAllDestinationDepartureByOrderId([1, 2]),
      ).resolves.toEqual([
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
      ]);
    });

    describe('실패하는 테스트', () => {
      test('존재하는 값과 존재하지 않는 값이 섞임', async () => {
        await expect(
          repository.findAllDestinationDepartureByOrderId([2, 3]),
        ).resolves.toEqual([
          {
            id: 2,
            departure: { x: 127.09, y: 37.527 },
            destination: { x: 127.8494, y: 37.5 },
          },
        ]);
      });

      test('존재하지 않는 값 입력', async () => {
        await expect(
          repository.findAllDestinationDepartureByOrderId([3, 4]),
        ).resolves.toEqual([]);
      });
    });
  });
});

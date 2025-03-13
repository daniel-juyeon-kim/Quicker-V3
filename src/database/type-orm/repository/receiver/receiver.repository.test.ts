import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ENTITY_MANAGER_KEY } from '@src/core/constant';
import { NotExistDataException } from '@src/core/exception';
import { ClsModule, ClsService, ClsServiceManager } from 'nestjs-cls';
import { EntityManager } from 'typeorm';
import { TestTypeormModule } from '../../../../../test/config/typeorm.module';
import {
  DepartureEntity,
  DestinationEntity,
  OrderEntity,
  ProductEntity,
  TransportationEntity,
  UserEntity,
} from '../../entity';
import { TransactionManager } from '../../util/transaction/transaction-manager/transaction-manager';
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

  return await manager.save(user);
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
  let manager: EntityManager;
  let cls: ClsService<{ [ENTITY_MANAGER_KEY]: EntityManager }>;

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
          ClsModule,
        ]),
      ],
      providers: [ReceiverRepository, TransactionManager],
    }).compile();

    repository = testModule.get(ReceiverRepository);
    manager = testModule.get(EntityManager);
    cls = ClsServiceManager.getClsService();
  });

  beforeEach(async () => {
    const user = await createUser(manager);
    await createOrder(manager, user);
  });

  afterEach(async () => {
    await Promise.allSettled([
      manager.clear(UserEntity),
      manager.clear(OrderEntity),
    ]);
  });

  describe('findPhoneNumberByOrderId', () => {
    test('통과하는 테스트', async () => {
      const orderId = 1;
      const result = {
        id: orderId,
        phone: '01012345678',
      };

      await cls.run(async () => {
        cls.set(ENTITY_MANAGER_KEY, manager);

        await expect(
          repository.findPhoneNumberByOrderId(orderId),
        ).resolves.toEqual(result);
      });
    });

    test('실패하는 테스트, 존재하지 않는 주문아이디를 입력하면 NotExistDataException을 던짐', async () => {
      const orderId = 32;
      const error = new NotExistDataException(orderId);

      await cls.run(async () => {
        cls.set(ENTITY_MANAGER_KEY, manager);

        await expect(
          repository.findPhoneNumberByOrderId(orderId),
        ).rejects.toStrictEqual(error);
      });
    });
  });
});

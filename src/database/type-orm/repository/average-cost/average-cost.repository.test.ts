import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ENTITY_MANAGER_KEY } from '@src/core/constant';
import { ClsModule, ClsService, ClsServiceManager } from 'nestjs-cls';
import { EntityManager } from 'typeorm';
import { TestTypeormModule } from '../../../../../test/config/typeorm.module';
import { AverageCostEntity } from '../../entity';
import { DuplicatedDataException, NotExistDataException } from '../../util';
import { TransactionManager } from '../../util/transaction/transaction-manager/transaction-manager';
import { AverageCostRepository } from './average-cost.repository';

describe('AverageCostRepository', () => {
  let module: TestingModule;
  let repository: AverageCostRepository;
  let manager: EntityManager;
  let cls: ClsService<{ [ENTITY_MANAGER_KEY]: EntityManager }>;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        TestTypeormModule,
        TypeOrmModule.forFeature([AverageCostEntity]),
        ClsModule.forRoot(),
      ],
      providers: [TransactionManager, AverageCostRepository],
    }).compile();

    manager = module.get(EntityManager);
    repository = module.get(AverageCostRepository);
    cls = ClsServiceManager.getClsService();
  });

  afterEach(async () => {
    await manager.clear(AverageCostEntity);
  });

  afterAll(async () => {
    await module.close();
  });

  describe('createAverageCost', () => {
    const average = {
      '5KM': 5,
      '10KM': 10,
      '15KM': 15,
      '20KM': 20,
      '25KM': 25,
      '30KM': 30,
      '40KM': 40,
      '50KM': 50,
      '60KM': 60,
      '60+KM': 70,
    };

    test('통과하는 테스트', async () => {
      const createDate = new Date(1990, 0, 1);

      await cls.run(() => {
        cls.set(ENTITY_MANAGER_KEY, manager);
        return repository.createAverageCost(average, createDate);
      });

      await expect(
        manager.existsBy(AverageCostEntity, { date: createDate }),
      ).resolves.toBe(true);
    });

    test('실패하는 테스트, 이미 데이터가 존재하면 DuplicatedDataException을 던짐', async () => {
      const createDate = new Date(1990, 4, 1);
      const error = new DuplicatedDataException(
        `${createDate}에 해당되는 데이터가 이미 존재합니다.`,
      );

      // 초기 저장
      await cls.run(async () => {
        cls.set(ENTITY_MANAGER_KEY, manager);
        await expect(
          repository.createAverageCost(average, createDate),
        ).resolves.not.toThrow();
      });

      // 중복 데이터 저장
      await cls.run(async () => {
        cls.set(ENTITY_MANAGER_KEY, manager);

        await expect(
          repository.createAverageCost(average, createDate),
        ).rejects.toStrictEqual(error);
      });
    });
  });

  describe('findAverageCostByDateAndDistanceUnit', () => {
    beforeEach(async () => {
      const averages = [
        {
          date: new Date(1993, 0, 1),
          '5KM': 5,
          '10KM': 10,
          '15KM': 15,
          '20KM': 20,
          '25KM': 25,
          '30KM': 30,
          '40KM': 40,
          '50KM': 50,
          '60KM': 60,
          '60+KM': 70,
        },
        {
          date: new Date(1993, 1, 1),
          '5KM': 329,
          '10KM': 4259,
          '15KM': 11923,
          '20KM': 23491,
          '25KM': 32489,
          '30KM': 32498,
          '40KM': 34982,
          '50KM': 34329,
          '60KM': 45903,
          '60+KM': 45098,
        },
      ];

      await manager.save(AverageCostEntity, averages);
    });

    afterEach(async () => {
      await manager.clear(AverageCostEntity);
    });

    test('통과하는 테스트', async () => {
      const lastMonth = new Date(1993, 1, 1);
      const distanceUnit = '40KM';
      const result = 34982;

      await cls.run(async () => {
        cls.set(ENTITY_MANAGER_KEY, manager);

        await expect(
          repository.findAverageCostByDateAndDistanceUnit({
            distanceUnit,
            lastMonth,
          }),
        ).resolves.toEqual(result);
      });
    });

    test('실패하는 테스트, 존재하지 않는 데이터를 조회하면 NotExistDataException을 던짐', async () => {
      const lastMonth = new Date(1993, 3, 1);
      const distanceUnit = '40KM';
      const error = new NotExistDataException(
        `${lastMonth}에 대한 데이터가 존재하지 않습니다.`,
      );

      await cls.run(async () => {
        cls.set(ENTITY_MANAGER_KEY, manager);

        await expect(
          repository.findAverageCostByDateAndDistanceUnit({
            distanceUnit,
            lastMonth,
          }),
        ).rejects.toStrictEqual(error);
      });
    });
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ENTITY_MANAGER_KEY } from '@src/core/constant';
import {
  DuplicatedDataException,
  NotExistDataException,
} from '@src/core/exception';
import { ClsModule, ClsService, ClsServiceManager } from 'nestjs-cls';
import { EntityManager } from 'typeorm';
import { TestTypeormModule } from '../../../../../test/config/typeorm.module';
import { AverageCostEntity } from '../../entity';
import { TransactionManager } from '../../util/transaction/transaction-manager/transaction-manager';
import { AverageCostRepository } from './average-cost.repository';

describe('AverageCostRepository', () => {
  let module: TestingModule;
  let averageRepository: AverageCostRepository;
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
    averageRepository = module.get(AverageCostRepository);
    cls = ClsServiceManager.getClsService();
  });

  afterEach(async () => {
    await manager.clear(AverageCostEntity);
  });

  afterAll(async () => {
    await module.close();
  });

  describe('create', () => {
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

    it('통과하는 테스트: 새로운 평균 비용 데이터를 생성한다', async () => {
      const createDate = new Date(1990, 0, 1);

      await cls.run(() => {
        cls.set(ENTITY_MANAGER_KEY, manager);
        return averageRepository.create(average, createDate);
      });

      await expect(
        manager.existsBy(AverageCostEntity, { date: createDate }),
      ).resolves.toBe(true);
    });

    it('실패하는 테스트: 이미 동일한 날짜의 데이터가 존재하면, DuplicatedDataException을 발생시킨다.', async () => {
      const createDate = new Date(1990, 4, 1);
      const error = new DuplicatedDataException(createDate);

      await cls.run(() => {
        cls.set(ENTITY_MANAGER_KEY, manager);
        return averageRepository.create(average, createDate);
      });

      await cls.run(async () => {
        cls.set(ENTITY_MANAGER_KEY, manager);
        await expect(
          averageRepository.create(average, createDate),
        ).rejects.toStrictEqual(error);
      });
    });
  });

  describe('findByDateAndDistanceUnit', () => {
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

    it('통과하는 테스트: 주어진 달과 거리 단위에 해당되는 평균 비용을 조회한다.', async () => {
      const lastMonth = new Date(1993, 1, 1);
      const distanceUnit = '40KM';
      const expectedCost = 34982;

      await cls.run(async () => {
        cls.set(ENTITY_MANAGER_KEY, manager);
        await expect(
          averageRepository.findByDateAndDistanceUnit({
            distanceUnit,
            lastMonth,
          }),
        ).resolves.toEqual(expectedCost);
      });
    });

    it('실패하는 테스트: 존재하지 않는 날짜의 데이터를 조회하면, NotExistDataException을 발생시켜야 한다', async () => {
      const lastMonth = new Date(1993, 3, 1);
      const distanceUnit = '40KM';
      const error = new NotExistDataException(lastMonth);

      await cls.run(async () => {
        cls.set(ENTITY_MANAGER_KEY, manager);
        await expect(
          averageRepository.findByDateAndDistanceUnit({
            distanceUnit,
            lastMonth,
          }),
        ).rejects.toStrictEqual(error);
      });
    });
  });
});

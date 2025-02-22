import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { TestTypeormModule } from '../../../../../test/config/typeorm.module';
import { AverageCostEntity } from '../../entity';
import { DuplicatedDataException, NotExistDataException } from '../../util';
import { AverageCostRepository } from './average-cost.repository';
import { ClsPluginTransactional } from '@nestjs-cls/transactional';
import { TransactionalAdapterTypeOrm } from '@nestjs-cls/transactional-adapter-typeorm';
import { ClsModule } from 'nestjs-cls';

describe('AverageCostRepository', () => {
  let testModule: TestingModule;
  let repository: AverageCostRepository;
  let ormRepository: Repository<AverageCostEntity>;

  beforeAll(async () => {
    testModule = await Test.createTestingModule({
      imports: [
        ClsModule.forRoot({
          plugins: [
            new ClsPluginTransactional({
              imports: [
                // module in which the database instance is provided
                TypeOrmModule,
              ],
              adapter: new TransactionalAdapterTypeOrm({
                // the injection token of the database instance
                dataSourceToken: DataSource,
              }),
            }),
          ],
        }),
        TestTypeormModule,
        TypeOrmModule.forFeature([AverageCostEntity]),
      ],
      providers: [AverageCostRepository],
    }).compile();

    ormRepository = testModule.get(getRepositoryToken(AverageCostEntity));
    repository = testModule.get(AverageCostRepository);
  });

  afterEach(async () => {
    await ormRepository.clear();
  });

  afterAll(async () => {
    await testModule.close();
  });

  describe('createAverage 테스트', () => {
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

      await repository.createAverageCost(average, createDate);

      await expect(ormRepository.existsBy({ date: createDate })).resolves.toBe(
        true,
      );
    });

    describe('실패하는 테스트', () => {
      test('이미 데이터가 존재하는 테스트, DuplicatedDataError를 던짐', async () => {
        const createDate = new Date(1990, 4, 1);
        const error = new DuplicatedDataException(
          `${createDate}에 해당되는 데이터가 이미 존재합니다.`,
        );

        // 초기 저장
        await expect(
          repository.createAverageCost(average, createDate),
        ).resolves.not.toThrow();

        // 중복 데이터 저장
        await expect(
          repository.createAverageCost(average, createDate),
        ).rejects.toStrictEqual(error);
      });
    });
  });

  describe('findLastMonthAverageCost 테스트', () => {
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

      await ormRepository.save(averages);
    });

    afterEach(async () => {
      await ormRepository.clear();
    });

    test('통과하는 테스트', async () => {
      const lastMonth = new Date(1993, 1, 1);
      const distanceUnit = '40KM';
      const result = 34982;

      await expect(
        repository.findAverageCostByDateAndDistanceUnit({
          distanceUnit,
          lastMonth,
        }),
      ).resolves.toEqual(result);
    });

    describe('실패하는 테스트', () => {
      test('존재하지 않는 데이터 조회 테스트, NotExistDataError를 던짐', async () => {
        const lastMonth = new Date(1993, 3, 1);
        const distanceUnit = '40KM';
        const error = new NotExistDataException(
          `${lastMonth}에 대한 데이터가 존재하지 않습니다.`,
        );

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

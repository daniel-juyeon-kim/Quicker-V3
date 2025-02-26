import { InternalServerErrorException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ENTITY_MANAGER_KEY } from '@src/core/constant';
import { AverageCostEntity } from '@src/database/type-orm/entity';
import { AverageCostRepository } from '@src/database/type-orm/repository';
import { ClsModule, ClsService, ClsServiceManager } from 'nestjs-cls';
import { EntityManager } from 'typeorm';
import { TestTypeormModule } from '../../../../../../test/config/typeorm.module';
import { TransactionManager } from '../transaction-manager/transaction-manager';

describe('Transactional 데코레이터 테스트', () => {
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

    test('실패하는 테스트, cls.run 외부에서 실행하면 InternalServerErrorException을 던짐', async () => {
      const createDate = new Date(1990, 0, 1);

      await expect(
        repository.createAverageCost(average, createDate),
      ).rejects.toEqual(
        new InternalServerErrorException('cls가 활성화 되어있지 않습니다.'),
      );
    });

    test('실패하는 테스트, 미들웨어에서 엔티티 매니저를 저장하지 않으면 InternalServerErrorException을 던짐', async () => {
      const createDate = new Date(1990, 0, 1);

      await cls.run(async () => {
        await expect(
          repository.createAverageCost(average, createDate),
        ).rejects.toEqual(
          new InternalServerErrorException(
            'cls 컨텍스트에서 엔티티 매니저를 찾을 수 없습니다.',
          ),
        );
      });
    });
  });
});

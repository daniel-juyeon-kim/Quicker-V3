import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ENTITY_MANAGER_KEY } from '@src/core/constant';
import { AverageCostEntity, OrderEntity } from '@src/database/type-orm/entity';
import { AbstractRepository } from '@src/database/type-orm/repository';
import { ClsModule, ClsService, ClsServiceManager } from 'nestjs-cls';
import { EntityManager } from 'typeorm';
import { TestTypeormModule } from '../../../../../../test/config/typeorm.module';
import { ClsErrorMessage } from '../constant';
import { TransactionManager } from '../transaction-manager/transaction-manager';
import { Transactional } from './transactional.decorator';

@Injectable()
class TransactionTest extends AbstractRepository<OrderEntity> {
  constructor(protected readonly transactionManager: TransactionManager) {
    super(OrderEntity);
  }

  @Transactional()
  activatedTransaction() {
    return this.getManager().queryRunner?.isTransactionActive ?? false;
  }

  deactivatedTransaction() {
    return this.getManager().queryRunner?.isTransactionActive ?? false;
  }

  @Transactional()
  getTxEntityManagerFromNewTransactionalDecorator(): EntityManager {
    return this.getManager();
  }
}

@Injectable()
class NestedTransactionTest extends AbstractRepository<OrderEntity> {
  constructor(
    protected readonly transactionManager: TransactionManager,
    private readonly transactionTest: TransactionTest,
  ) {
    super(OrderEntity);
  }

  @Transactional()
  getTxEntityManagerFromInnerOuterTransactionalDecorator() {
    const outerTxEntityManager = this.transactionManager.getManager();
    const innerTxEntityManager =
      this.transactionTest.getTxEntityManagerFromNewTransactionalDecorator();

    return { outerTxEntityManager, innerTxEntityManager };
  }
}

describe('Transactional 데코레이터', () => {
  let module: TestingModule;
  let service: TransactionTest;
  let nestedTxService: NestedTransactionTest;
  let manager: EntityManager;
  let cls: ClsService<{ [ENTITY_MANAGER_KEY]: EntityManager }>;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        TestTypeormModule,
        TypeOrmModule.forFeature([AverageCostEntity]),
        ClsModule.forRoot(),
      ],
      providers: [TransactionManager, TransactionTest, NestedTransactionTest],
    }).compile();

    manager = module.get(EntityManager);
    service = module.get(TransactionTest);
    nestedTxService = module.get(NestedTransactionTest);
    cls = ClsServiceManager.getClsService();
  });

  afterEach(async () => {
    await manager.clear(AverageCostEntity);
  });

  afterAll(async () => {
    await module.close();
  });

  describe('Transactional 데코레이터', () => {
    it('CLS 컨텍스트가 활성화된 상태에서 @Transactional 메소드를 호출하면, 트랜잭션이 활성화되어야 한다', async () => {
      await cls.run(async () => {
        cls.set(ENTITY_MANAGER_KEY, manager);

        await expect(service.activatedTransaction()).resolves.toBe(true);
      });
    });

    it('CLS 컨텍스트가 없는 상태에서 @Transactional 메소드를 호출하면, 예외를 발생시켜야 한다', async () => {
      await expect(service.activatedTransaction()).rejects.toEqual(
        new InternalServerErrorException(ClsErrorMessage.CLS_NOT_ACTIVE),
      );
    });

    it('@Transactional이 없는 메소드를 호출하면, 트랜잭션이 활성화되지 않아야 한다', async () => {
      await cls.run(async () => {
        cls.set(ENTITY_MANAGER_KEY, manager);

        expect(service.deactivatedTransaction()).toBe(false);
      });
    });

    describe('중첩 트랜잭션', () => {
      it('외부 트랜잭션 내에서 내부 트랜잭션 메소드를 호출하면, 두 메소드는 동일한 EntityManager 인스턴스를 공유해야 한다', async () => {
        await cls.run(async () => {
          cls.set(ENTITY_MANAGER_KEY, manager);

          const { innerTxEntityManager, outerTxEntityManager } =
            nestedTxService.getTxEntityManagerFromInnerOuterTransactionalDecorator();

          expect(innerTxEntityManager === outerTxEntityManager).toBe(true);
        });
      });
    });
  });
});

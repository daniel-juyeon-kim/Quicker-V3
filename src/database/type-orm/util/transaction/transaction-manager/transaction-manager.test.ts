import { InternalServerErrorException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ENTITY_MANAGER_KEY } from '@src/core/constant';
import { mock } from 'jest-mock-extended';
import { ClsModule, ClsService, ClsServiceManager } from 'nestjs-cls';
import { EntityManager } from 'typeorm';
import { TransactionManager } from './transaction-manager';

describe('TransactionManager', () => {
  let transactionManager: TransactionManager;
  let cls: ClsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TransactionManager, ClsModule],
    }).compile();

    transactionManager = module.get(TransactionManager);
    cls = ClsServiceManager.getClsService();
  });

  describe('getManager', () => {
    it('통과하는 테스트, cls 컨텍스트에 엔티티 매니저가 존재하면 반환해야 한다', () => {
      const entityManager = mock<EntityManager>();

      const result = cls.run(() => {
        cls.set(ENTITY_MANAGER_KEY, entityManager);
        return transactionManager.getManager();
      });

      expect(result).toEqual(entityManager).not.toBeFalsy();
    });

    it('실패하는 테스트, cls 컨텍스트에 엔티티 매니저가 존재하지 않으면 InternalServerErrorException을 던짐', () => {
      cls.run(() => {
        expect(() => transactionManager.getManager()).toThrow(
          new InternalServerErrorException(
            'cls 컨텍스트에서 엔티티 매니저를 찾을 수 없습니다.',
          ),
        );
      });
    });
  });
});

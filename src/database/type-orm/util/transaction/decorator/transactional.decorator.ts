import { InternalServerErrorException } from '@nestjs/common';
import { ENTITY_MANAGER_KEY } from '@src/core/constant';
import { ClsService, ClsServiceManager, ClsStore } from 'nestjs-cls';
import { EntityManager } from 'typeorm';
import { ClsErrorMessage } from '../constant';

export const Transactional = () => {
  return (
    target: object,
    propertyKey: string | symbol,
    descriptor: PropertyDescriptor,
  ) => {
    // 이미 트랜잭션 엔티티 매니저가 있는지 확인하는 코드가 필요함
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const cls = ClsServiceManager.getClsService();

      validateCls(cls);

      const entityManager: EntityManager = cls.get(ENTITY_MANAGER_KEY);

      validateEntityManager(entityManager);

      // const isTransactionActive = entityManager.queryRunner?.isTransactionActive
      //   ? true
      //   : false;

      // if (isTransactionActive) {
      //   return await originalMethod.apply(this, args);
      // }

      return await entityManager.transaction(
        async (transactionEntityManager) => {
          cls.set(ENTITY_MANAGER_KEY, transactionEntityManager);

          return await originalMethod.apply(this, args);
        },
      );
    };
  };
};

const validateEntityManager = (entityManager: EntityManager) => {
  if (!entityManager) {
    throw new InternalServerErrorException(
      ClsErrorMessage.NOT_FOUND_ENTITY_MANAGER,
    );
  }
};

const validateCls = (cls: ClsService<ClsStore>) => {
  if (!cls.isActive()) {
    throw new InternalServerErrorException(ClsErrorMessage.CLS_NOT_ACTIVE);
  }
};

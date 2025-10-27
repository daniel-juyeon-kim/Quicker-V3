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
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const cls = ClsServiceManager.getClsService();

      validateCls(cls);

      const entityManager: EntityManager = cls.get(ENTITY_MANAGER_KEY);

      validateEntityManager(entityManager);

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

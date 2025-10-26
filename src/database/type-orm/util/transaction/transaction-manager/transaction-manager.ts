import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ENTITY_MANAGER_KEY } from '@src/core/constant';
import { ClsServiceManager } from 'nestjs-cls';
import { EntityManager } from 'typeorm';
import { ClsErrorMessage } from '../constant';

@Injectable()
export class TransactionManager {
  public getManager() {
    const cls = ClsServiceManager.getClsService();

    const entityManager: EntityManager = cls.get(ENTITY_MANAGER_KEY);

    this.validateEntityManager(entityManager);

    return entityManager;
  }

  private validateEntityManager(entityManager: EntityManager) {
    if (entityManager === undefined) {
      throw new InternalServerErrorException(
        ClsErrorMessage.NOT_FOUND_ENTITY_MANAGER,
      );
    }
  }
}

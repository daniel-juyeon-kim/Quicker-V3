import { NotExistDataException } from '@src/core/exception';
import { isNull, isUndefined } from '@src/core/util';
import { EntityTarget } from 'typeorm';
import { TransactionManager } from '../util/transaction/transaction-manager/transaction-manager';

export abstract class AbstractRepository<T> {
  protected abstract readonly transactionManager: TransactionManager;
  constructor(protected readonly entity: EntityTarget<T>) {}

  /**
   * TransactionManager를 통해 엔티티 매니저를 가져오는 메서드
   *
   * 이 메서드를 호출되는 상위 메서드들 중에서 Transactional 데코레이터가 적용되어 있으면 트랜잭션이 걸려있는 EntityManager를 반환한다.
   * 반대로 상위 메서드들 중에서 Transactional 데코레이터를 적용하지 않으면 일반 EntityManager를 반환한다.
   *
   * @returns EntityManager
   */
  protected getManager() {
    return this.transactionManager.getManager();
  }

  protected getRepository() {
    return this.getManager().getRepository(this.entity);
  }

  // eslint-disable-next-line @typescript-eslint/no-wrapper-object-types
  protected validateNotNull<T>(
    findOption: any,
    data: T | null,
  ): asserts data is T {
    if (isNull(data) || isUndefined(data)) {
      throw new NotExistDataException(findOption);
    }
  }
}

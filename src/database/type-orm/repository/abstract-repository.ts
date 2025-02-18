import { Inject } from '@nestjs/common';
import { isNull } from '@src/core/util';
import { EntityManager } from 'typeorm';
import { NotExistDataException } from '../util';

export abstract class AbstractRepository {
  @Inject(EntityManager)
  protected readonly manager: EntityManager;

  // eslint-disable-next-line @typescript-eslint/no-wrapper-object-types
  protected validateNotNull<F extends Object, T>(
    findOption: F,
    data: T | null,
  ): asserts data is T {
    if (isNull(data)) {
      throw new NotExistDataException(
        `${findOption.toString()}에 대한 데이터가 존재하지 않습니다.`,
      );
    }
  }
}

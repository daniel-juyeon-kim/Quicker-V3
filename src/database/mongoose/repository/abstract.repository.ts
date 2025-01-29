import { isNull } from '@src/core/util';
import { NotExistDataError } from '../../type-orm';

export abstract class MongoRepository {
  protected validateNull<T>(data: T | null): asserts data is T {
    if (isNull(data)) {
      throw new NotExistDataError('데이터가 존재하지 않습니다.');
    }
  }
}

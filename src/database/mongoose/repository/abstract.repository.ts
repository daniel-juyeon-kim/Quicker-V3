import { isNull } from '@src/core/util';
import { mongo } from 'mongoose';
import { NotExistDataException } from '../../type-orm';

export abstract class MongoRepository {
  private readonly ERROR_CODE_DUPLICATED_DATA = 11000;

  protected validateNull<T>(data: T | null): asserts data is T {
    if (isNull(data)) {
      throw new NotExistDataException('데이터가 존재하지 않습니다.');
    }
  }

  protected isDuplicatedDataError(error: Error | mongo.MongoServerError) {
    return (
      error instanceof mongo.MongoServerError &&
      error.code === this.ERROR_CODE_DUPLICATED_DATA
    );
  }
}

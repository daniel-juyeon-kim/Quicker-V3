import { NotExistDataException } from '@src/core/exception';
import { isNull } from '@src/core/util';
import { mongo } from 'mongoose';
export abstract class MongoRepository {
  private readonly ERROR_CODE_DUPLICATED_DATA = 11000;

  protected validateNull<T>(
    findOption: any,
    value: T | null,
  ): asserts value is T {
    if (isNull(value)) {
      throw new NotExistDataException(findOption);
    }
  }

  protected isDuplicatedDataError(error: Error | mongo.MongoServerError) {
    return (
      error instanceof mongo.MongoServerError &&
      error.code === this.ERROR_CODE_DUPLICATED_DATA
    );
  }
}

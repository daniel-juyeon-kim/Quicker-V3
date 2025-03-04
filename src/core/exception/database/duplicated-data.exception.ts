import { DataBaseExceptionMessage } from '@src/core/constant/exception-message/database.enum';
import { DataBaseException } from './database.exception';

export class DuplicatedDataException extends DataBaseException {
  constructor(
    target?: string,
    value?: string | number,
    cause: string = DataBaseExceptionMessage.DuplicatedDataException,
  ) {
    super(target, value, cause);
  }
}

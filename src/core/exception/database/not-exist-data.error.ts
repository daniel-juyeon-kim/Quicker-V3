import { DataBaseExceptionMessage } from '@src/core/constant/exception-message/database.enum';
import { DataBaseException } from './database.exception';

export class NotExistDataException extends DataBaseException {
  constructor(
    target?: string,
    value?: string | number,
    cause: string = DataBaseExceptionMessage.NotExistDataException,
  ) {
    super(target, value, cause);
  }
}

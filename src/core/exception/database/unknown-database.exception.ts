import { DataBaseExceptionMessage } from '@src/core/constant/exception-message/database.enum';
import { DataBaseException } from './database.exception';

export class UnknownDataBaseException extends DataBaseException {
  constructor(
    public readonly error: Error,
    target?: string,
    value?: string | number,
    cause: string = DataBaseExceptionMessage.UnknownDataBaseException,
  ) {
    super(target, value, cause);
  }
}

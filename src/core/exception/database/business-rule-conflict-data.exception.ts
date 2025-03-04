import { DataBaseExceptionMessage } from '@src/core/constant/exception-message/database.enum';
import { DataBaseException } from './database.exception';

export class BusinessRuleConflictDataException extends DataBaseException {
  constructor(
    target?: string,
    value?: string | number,
    cause: string = DataBaseExceptionMessage.BusinessRuleConflictDataException,
  ) {
    super(target, value, cause);
  }
}

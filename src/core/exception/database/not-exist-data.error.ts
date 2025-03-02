import { DataBaseExceptionMessage } from '@src/database/type-orm/util/exception/constant/exception-messages.enum';
import { DataBaseException } from './database.exception';

export class NotExistDataException extends DataBaseException {
  constructor(
    message: string = DataBaseExceptionMessage.NotExistDataException,
  ) {
    super(message);
  }
}

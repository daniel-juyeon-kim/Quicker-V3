import { DataBaseExceptionMessage } from '@src/core/constant/exception-message/database.enum';
import { CustomException } from '../custom.exception';

export abstract class DataBaseException extends CustomException {
  constructor(
    public readonly target?: string,
    public readonly value?: string | number,
    public readonly cause: string = DataBaseExceptionMessage.DataBaseException,
  ) {
    super();
  }
}

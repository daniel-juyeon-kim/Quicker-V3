import { HttpStatus } from '@nestjs/common';
import { DataBaseExceptionMessage } from '@src/core/constant/exception-message/database.enum';
import { DataBaseException } from './database.exception';

export class NotExistDataException extends DataBaseException {
  private static readonly statusCode: HttpStatus = HttpStatus.NOT_FOUND;

  constructor(
    value: string | number | Date | Record<string, any>,
    message: string = DataBaseExceptionMessage.NotExistDataException,
  ) {
    super(value, message, NotExistDataException.statusCode);
  }
}

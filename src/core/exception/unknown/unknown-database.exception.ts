import { HttpStatus } from '@nestjs/common';
import { DataBaseExceptionMessage } from '@src/core/constant/exception-message/database.enum';
import { UnknownException } from './unknown.exception';

export class UnknownDataBaseException extends UnknownException {
  private static readonly statusCode: HttpStatus =
    HttpStatus.INTERNAL_SERVER_ERROR;

  constructor(
    error: Error,
    message: string = DataBaseExceptionMessage.UnknownDataBaseException,
  ) {
    super(error, message, UnknownDataBaseException.statusCode);
  }
}

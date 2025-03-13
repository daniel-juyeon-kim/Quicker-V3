import { HttpStatus } from '@nestjs/common';
import { DataBaseExceptionMessage } from '@src/core/constant/exception-message/database.enum';
import { AbstractUnknownException } from './unknown.exception';

export class UnknownDataBaseException extends AbstractUnknownException<Error> {
  private static readonly code: HttpStatus = HttpStatus.INTERNAL_SERVER_ERROR;
  protected readonly error: Error;

  constructor(
    error: Error,
    message: string = DataBaseExceptionMessage.UnknownDataBaseException,
  ) {
    super(message, UnknownDataBaseException.code);
    this.error = error;
  }
}

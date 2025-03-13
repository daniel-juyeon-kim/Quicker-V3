import { HttpStatus } from '@nestjs/common';
import { DataBaseExceptionMessage } from '@src/core/constant/exception-message/database.enum';
import { DataBaseException } from './database.exception';
import { ErrorDetail } from './error-detail';

export class NotExistDataException extends DataBaseException {
  private static readonly code: HttpStatus = HttpStatus.NOT_FOUND;
  protected readonly error: ErrorDetail;

  constructor(
    value: unknown,
    message: string = DataBaseExceptionMessage.NotExistDataException,
  ) {
    super(message, NotExistDataException.code);
    this.error = new ErrorDetail(value);
  }
}

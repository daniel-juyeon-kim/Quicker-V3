import { HttpStatus } from '@nestjs/common';
import { DataBaseExceptionMessage } from '@src/core/constant/exception-message/database.enum';
import { DataBaseException } from './database.exception';
import { ErrorDetail } from './error-detail';

export class DuplicatedDataException extends DataBaseException {
  private static readonly code: HttpStatus = HttpStatus.CONFLICT;
  protected readonly error: ErrorDetail;

  constructor(
    value: unknown,
    message: string = DataBaseExceptionMessage.DuplicatedDataException,
  ) {
    super(message, DuplicatedDataException.code);
    this.error = new ErrorDetail(value);
  }
}

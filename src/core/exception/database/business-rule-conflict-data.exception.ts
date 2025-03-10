import { HttpStatus } from '@nestjs/common';
import { DataBaseExceptionMessage } from '@src/core/constant/exception-message/database.enum';
import { DataBaseException } from './database.exception';
import { ErrorDetail } from './error-detail';

export class BusinessRuleConflictDataException extends DataBaseException {
  private static readonly code: HttpStatus = HttpStatus.UNPROCESSABLE_ENTITY;
  protected readonly error: ErrorDetail;

  constructor(
    value: unknown,
    message: string = DataBaseExceptionMessage.BusinessRuleConflictDataException,
  ) {
    super(message, BusinessRuleConflictDataException.code);
    this.error = new ErrorDetail(value);
  }
}

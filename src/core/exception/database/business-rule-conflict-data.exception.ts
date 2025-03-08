import { HttpStatus } from '@nestjs/common';
import { DataBaseExceptionMessage } from '@src/core/constant/exception-message/database.enum';
import { DataBaseException } from './database.exception';

export class BusinessRuleConflictDataException extends DataBaseException {
  private static readonly statusCode: HttpStatus =
    HttpStatus.UNPROCESSABLE_ENTITY;

  constructor(
    value: string | number | Date | Record<string, any>,
    message: string = DataBaseExceptionMessage.BusinessRuleConflictDataException,
  ) {
    super(value, message, BusinessRuleConflictDataException.statusCode);
  }
}

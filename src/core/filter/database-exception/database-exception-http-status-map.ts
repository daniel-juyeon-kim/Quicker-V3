import { HttpStatus, Injectable } from '@nestjs/common';
import {
  BusinessRuleConflictDataException,
  DataBaseException,
  DuplicatedDataException,
  NotExistDataException,
} from '@src/core/exception';
import { UnknownDataBaseException } from '@src/core/exception/database/unknown-database.exception';
import { isUndefined } from '@src/core/util';
import { DataBaseExceptions } from './database-exception.type';

@Injectable()
export class DatabaseExceptionHttpStatusMap {
  private readonly httpStatusMap = new Map<DataBaseExceptions, HttpStatus>([
    [DuplicatedDataException, HttpStatus.CONFLICT],
    [NotExistDataException, HttpStatus.NOT_FOUND],
    [UnknownDataBaseException, HttpStatus.INTERNAL_SERVER_ERROR],
    [BusinessRuleConflictDataException, HttpStatus.UNPROCESSABLE_ENTITY],
  ]);

  getHttpStatus(exception: DataBaseException): HttpStatus {
    const statusCode = this.httpStatusMap.get(
      exception.constructor as DataBaseExceptions,
    );

    if (isUndefined(statusCode)) {
      return HttpStatus.INTERNAL_SERVER_ERROR;
    }
    return statusCode;
  }

  isUnknownException(exception: DataBaseException) {
    const statusCode = this.httpStatusMap.get(
      exception.constructor as DataBaseExceptions,
    );

    return (
      exception instanceof UnknownDataBaseException || isUndefined(statusCode)
    );
  }
}

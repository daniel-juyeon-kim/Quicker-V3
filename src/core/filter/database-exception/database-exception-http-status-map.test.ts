import { HttpStatus } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import {
  BusinessRuleConflictDataException,
  DataBaseException,
  DuplicatedDataException,
  NotExistDataException,
} from '@src/core/exception';
import { UnknownDataBaseException } from '@src/core/exception/database/unknown-database.exception';
import { DatabaseExceptionHttpStatusMap } from './database-exception-http-status-map';

describe('DatabaseExceptionHttpStatusMap', () => {
  let service: DatabaseExceptionHttpStatusMap;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DatabaseExceptionHttpStatusMap],
    }).compile();

    service = module.get<DatabaseExceptionHttpStatusMap>(
      DatabaseExceptionHttpStatusMap,
    );
  });

  it('DuplicatedDataException에 대해 CONFLICT를 반환해야 한다', () => {
    const exception = new DuplicatedDataException();

    expect(service.getHttpStatus(exception)).toBe(HttpStatus.CONFLICT);
  });

  it('NotExistDataException에 대해 NOT_FOUND를 반환해야 한다', () => {
    const exception = new NotExistDataException();

    expect(service.getHttpStatus(exception)).toBe(HttpStatus.NOT_FOUND);
  });

  it('UnknownDataBaseException에 대해 INTERNAL_SERVER_ERROR를 반환해야 한다', () => {
    const exception = new UnknownDataBaseException(new Error());

    expect(service.getHttpStatus(exception)).toBe(
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  });

  it('BusinessRuleConflictDataException에 대해 UNPROCESSABLE_ENTITY를 반환해야 한다', () => {
    const exception = new BusinessRuleConflictDataException();

    expect(service.getHttpStatus(exception)).toBe(
      HttpStatus.UNPROCESSABLE_ENTITY,
    );
  });

  it('알 수 없는 예외에 대해 INTERNAL_SERVER_ERROR를 반환해야 한다', () => {
    class UnknownException extends DataBaseException {}

    const exception = new UnknownException();

    expect(service.getHttpStatus(exception)).toBe(
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  });

  it('isUnknownException에서 UnknownDataBaseException에 대해 true를 반환해야 한다', () => {
    const exception = new UnknownDataBaseException(new Error());

    expect(service.isUnknownException(exception)).toBe(true);
  });

  it('isUnknownException에서 알 수 없는 예외에 대해 true를 반환해야 한다', () => {
    class UnknownException extends DataBaseException {}

    const exception = new UnknownException();

    expect(service.isUnknownException(exception)).toBe(true);
  });

  it('isUnknownException에서 알려진 예외에 대해 false를 반환해야 한다', () => {
    const exception = new DuplicatedDataException();

    expect(service.isUnknownException(exception)).toBe(false);
  });
});

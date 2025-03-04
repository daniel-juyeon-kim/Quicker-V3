import { TestBed } from '@automock/jest';
import {
  ArgumentsHost,
  ConflictException,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import {
  BusinessRuleConflictDataException,
  DuplicatedDataException,
  NotExistDataException,
} from '@src/core/exception';
import { UnknownDataBaseException } from '@src/core/exception/database/unknown-database.exception';
import { mock } from 'jest-mock-extended';
import { DatabaseExceptionFilter } from './database-exception.filter';

describe('DatabaseExceptionFilter', () => {
  let filter: DatabaseExceptionFilter;
  const mockHost = mock<ArgumentsHost>();

  beforeEach(() => {
    const { unit } = TestBed.create(DatabaseExceptionFilter).compile();

    filter = unit;
  });

  describe('catch', () => {
    test('DuplicatedDataException 처리', async () => {
      const exception = new DuplicatedDataException();

      expect(() => filter.catch(exception, mockHost))
        .toThrow(ConflictException)
        .toThrow(exception.message)
        .not.toThrow(NotFoundException);
    });

    test('NotExistDataException 처리', async () => {
      const exception = new NotExistDataException();

      expect(() => filter.catch(exception, mockHost))
        .toThrow(NotFoundException)
        .toThrow(exception.message)
        .not.toThrow(UnprocessableEntityException);
    });

    test('BusinessRuleConflictDataException 처리', async () => {
      const exception = new BusinessRuleConflictDataException();

      expect(() => filter.catch(exception, mockHost))
        .toThrow(UnprocessableEntityException)
        .toThrow(exception.message)
        .not.toThrow(NotFoundException);
    });

    test('UnknownDataBaseException 처리', async () => {
      const exception = new UnknownDataBaseException(new Error());

      expect(() => filter.catch(exception, mockHost))
        .not.toThrow(UnprocessableEntityException)
        .not.toThrow(NotFoundException)
        .not.toThrow(ConflictException);
    });
  });
});

import { TestBed } from '@automock/jest';
import {
  ArgumentsHost,
  ConflictException,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { UnknownDataBaseException } from '@src/core/module';
import {
  BusinessRuleConflictDataException,
  DuplicatedDataException,
  NotExistDataException,
} from '@src/database';
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
      const exception = new DuplicatedDataException(
        '중복된 데이터가 존재합니다.',
      );

      expect(() => filter.catch(exception, mockHost))
        .toThrow(ConflictException)
        .toThrow(exception.message)
        .not.toThrow(NotFoundException);
    });

    test('NotExistDataException 처리', async () => {
      const exception = new NotExistDataException(
        '데이터가 존재하지 않습니다.',
      );

      expect(() => filter.catch(exception, mockHost))
        .toThrow(NotFoundException)
        .toThrow(exception.message)
        .not.toThrow(UnprocessableEntityException);
    });

    test('BusinessRuleConflictDataException 처리', async () => {
      const exception = new BusinessRuleConflictDataException(
        '비지니스 규칙에 어긋나는 요청',
      );

      expect(() => filter.catch(exception, mockHost))
        .toThrow(UnprocessableEntityException)
        .toThrow(exception.message)
        .not.toThrow(NotFoundException);
    });

    test('UnknownDataBaseException 처리', async () => {
      const exception = new UnknownDataBaseException(
        '알 수 없는 데이터 베이스 에러',
      );

      expect(() => filter.catch(exception, mockHost))
        .not.toThrow(UnprocessableEntityException)
        .not.toThrow(NotFoundException)
        .not.toThrow(ConflictException);
    });
  });
});

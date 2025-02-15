import { TestBed } from '@automock/jest';
import { ArgumentsHost, Logger } from '@nestjs/common';
import { ErrorMessageBotException, TmapApiException } from '@src/core/module';
import { mock } from 'jest-mock-extended';
import { ErrorMessageBotExceptionFilter } from './error-message-bot-exception.filter';

describe('ErrorMessageBotExceptionFilter', () => {
  let filter: ErrorMessageBotExceptionFilter;
  let logger: jest.Mocked<Logger>;

  const mockHost = mock<ArgumentsHost>();

  beforeEach(async () => {
    const { unit, unitRef } = TestBed.create(
      ErrorMessageBotExceptionFilter,
    ).compile();

    filter = unit;
    logger = unitRef.get(Logger);
  });

  describe('catch', () => {
    test('통과하는 테스트', () => {
      const exception = new ErrorMessageBotException('에러');

      expect(() => filter.catch(exception, mockHost)).not.toThrow();
      expect(logger.log).toHaveBeenCalled();
    });

    test('실패하는 테스트, 해당 필터가 담당하지 않는 에러', () => {
      const exception = new TmapApiException('에러');

      expect(() => filter.catch(exception, mockHost)).not.toThrow();
      expect(logger.log).not.toHaveBeenCalled();
    });
  });
});

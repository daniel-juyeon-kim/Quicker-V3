import { TestBed } from '@automock/jest';
import { ArgumentsHost, LoggerService } from '@nestjs/common';
import { ChatPostMessageResponse } from '@slack/web-api';
import { LoggerToken } from '@src/core/constant';
import {
  ErrorMessageBotException,
  TmapApiException,
} from '@src/core/exception';
import { ErrorResponseBody } from '@src/core/module';
import { mock } from 'jest-mock-extended';
import { ErrorMessageBotExceptionFilter } from './error-message-bot-exception.filter';

describe('ErrorMessageBotExceptionFilter', () => {
  let filter: ErrorMessageBotExceptionFilter;
  let logger: jest.Mocked<LoggerService>;

  const mockHost = mock<ArgumentsHost>();

  beforeEach(async () => {
    const { unit, unitRef } = TestBed.create(
      ErrorMessageBotExceptionFilter,
    ).compile();

    filter = unit;
    logger = unitRef.get(LoggerToken.ERROR_MESSAGE_BOT_EXCEPTION_LOGGER);
  });

  describe('catch', () => {
    test('통과하는 테스트', () => {
      const response: ChatPostMessageResponse = {} as ChatPostMessageResponse;
      const exception = new ErrorMessageBotException(response);

      expect(() => filter.catch(exception, mockHost)).not.toThrow();
      expect(logger.log).toHaveBeenCalled();
    });

    test('실패하는 테스트, 해당 필터가 담당하지 않는 에러', () => {
      const response: ErrorResponseBody = {
        error: {
          id: 'id',
          category: 'category',
          code: 'code',
          message: 'message',
        },
      };
      const exception = new TmapApiException(response);

      expect(() => filter.catch(exception, mockHost)).not.toThrow();
      expect(logger.log).not.toHaveBeenCalled();
    });
  });
});

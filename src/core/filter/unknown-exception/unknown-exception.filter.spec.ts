import { ArgumentsHost, HttpStatus, LoggerService } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { ChatPostMessageResponse } from '@slack/web-api';
import { CoreToken } from '@src/core/constant';
import { ExternalApiExceptionMessage } from '@src/core/constant/exception-message/external-api.enum';
import {
  AbstractUnknownException,
  ErrorMessageBotException,
  SmsApiException,
  TmapApiException,
} from '@src/core/exception';
import { ErrorMessageBot, TmapApiErrorResponseBody } from '@src/core/module';
import { NaverSmsApiResponse } from '@src/core/module/external-api/sms-api/naver-sms-api.response';
import { Response } from 'express';
import { mock, mockDeep, mockReset } from 'jest-mock-extended';
import { UnknownExceptionLoggerMap } from './unknown-exception-logger-map';
import { UnknownExceptionFilter } from './unknown-exception.filter';

describe('UnknownExceptionFilter', () => {
  let filter: UnknownExceptionFilter;
  const mockHost = mock<ArgumentsHost>();
  const mockResponse = mockDeep<Response>();

  const errorMessageBot = mock<ErrorMessageBot>();
  const unknownExceptionLoggerMap = mock<UnknownExceptionLoggerMap>();
  const mockLogger = mock<LoggerService>();

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        UnknownExceptionFilter,
        { provide: CoreToken.ERROR_MESSAGE_BOT, useValue: errorMessageBot },
        {
          provide: UnknownExceptionLoggerMap,
          useValue: unknownExceptionLoggerMap,
        },
      ],
    }).compile();

    filter = module.get(UnknownExceptionFilter);

    mockReset(mockHost);
    mockReset(mockResponse);
    mockReset(errorMessageBot);
    mockReset(unknownExceptionLoggerMap);
    mockReset(mockLogger);

    mockHost.switchToHttp.mockReturnValue({
      getResponse: () => mockResponse,
    } as any);

    unknownExceptionLoggerMap.getLogger.mockReturnValue(mockLogger);

    mockResponse.status.mockReturnThis();
    mockResponse.json.mockReturnThis();
  });

  describe('catch', () => {
    test('통과: ErrorMessageBotError', async () => {
      const error = {} as ChatPostMessageResponse;
      const exception = new ErrorMessageBotException(error);

      await filter.catch(exception, mockHost);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_GATEWAY);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: ExternalApiExceptionMessage.ErrorMessageBotException,
        code: HttpStatus.BAD_GATEWAY,
      });
    });

    test('통과: TmapApiError', async () => {
      const response = {} as TmapApiErrorResponseBody;
      const exception = new TmapApiException(response);

      await filter.catch(exception, mockHost);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_GATEWAY);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: ExternalApiExceptionMessage.TmapApiException,
        code: HttpStatus.BAD_GATEWAY,
      });
    });

    test('통과: SmsApiError', async () => {
      const response = {} as NaverSmsApiResponse;
      const exception = new SmsApiException(response);

      await filter.catch(exception, mockHost);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_GATEWAY);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: ExternalApiExceptionMessage.SmsApiException,
        code: HttpStatus.BAD_GATEWAY,
      });
    });

    test('실패: 모르는 예외', async () => {
      class UnhandledException extends AbstractUnknownException<unknown> {
        protected error: unknown;
      }

      const message = 'error message';
      const code = HttpStatus.BAD_GATEWAY;
      const exception = new UnhandledException(message, code);

      await filter.catch(exception, mockHost);

      expect(mockResponse.status).toHaveBeenCalledWith(code);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message,
        code,
      });
    });
  });
});

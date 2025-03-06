import { ArgumentsHost, HttpStatus, LoggerService } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { ChatPostMessageResponse } from '@slack/web-api';
import { CoreToken } from '@src/core/constant';
import { ExternalApiExceptionMessage } from '@src/core/constant/exception-message/external-api.enum';
import {
  ErrorMessageBotException,
  ExternalApiException,
  SmsApiException,
  TmapApiException,
} from '@src/core/exception';
import { ErrorMessageBot, ErrorResponseBody } from '@src/core/module';
import { NaverSmsApiResponse } from '@src/core/module/external-api/sms-api/naver-sms-api.response';
import { Response } from 'express';
import { mock, mockDeep, mockReset } from 'jest-mock-extended';
import { ExternalApiExceptionLoggerMap } from './external-api-exception-logger-map';
import { ExternalApiExceptionFilter } from './external-api-exception.filter';

describe('ExternalApiExceptionFilter', () => {
  let filter: ExternalApiExceptionFilter;
  const mockHost = mock<ArgumentsHost>();
  const mockResponse = mockDeep<Response>();

  const errorMessageBot = mock<ErrorMessageBot>();
  const externalApiExceptionLoggerMap = mock<ExternalApiExceptionLoggerMap>();
  const mockLogger = mock<LoggerService>();

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        ExternalApiExceptionFilter,
        { provide: CoreToken.ERROR_MESSAGE_BOT, useValue: errorMessageBot },
        {
          provide: ExternalApiExceptionLoggerMap,
          useValue: externalApiExceptionLoggerMap,
        },
      ],
    }).compile();

    filter = module.get(ExternalApiExceptionFilter);

    mockReset(mockHost);
    mockReset(mockResponse);
    mockReset(errorMessageBot);
    mockReset(externalApiExceptionLoggerMap);
    mockReset(mockLogger);

    mockHost.switchToHttp.mockReturnValue({
      getResponse: () => mockResponse,
    } as any);

    externalApiExceptionLoggerMap.getLogger.mockReturnValue(mockLogger);

    mockResponse.status.mockReturnThis();
    mockResponse.json.mockReturnThis();
  });

  describe('catch', () => {
    test('통과하는 테스트, ErrorMessageBotError', async () => {
      const error = {} as ChatPostMessageResponse;
      const exception = new ErrorMessageBotException(error);

      await filter.catch(exception, mockHost);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_GATEWAY);
      expect(mockResponse.json).toHaveBeenCalledWith({
        cause: ExternalApiExceptionMessage.ErrorMessageBotException,
      });
    });

    test('통과하는 테스트, TmapApiError', async () => {
      const response = {} as ErrorResponseBody;
      const exception = new TmapApiException(response);

      await filter.catch(exception, mockHost);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_GATEWAY);
      expect(mockResponse.json).toHaveBeenCalledWith({
        cause: ExternalApiExceptionMessage.TmapApiException,
      });
    });

    test('통과하는 테스트, SmsApiError', async () => {
      const response = {} as NaverSmsApiResponse;
      const exception = new SmsApiException(response);

      await filter.catch(exception, mockHost);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_GATEWAY);
      expect(mockResponse.json).toHaveBeenCalledWith({
        cause: ExternalApiExceptionMessage.SmsApiException,
      });
    });
    test('실패하는 테스트, 처리되지 않은 예외', async () => {
      class UnhandledException extends ExternalApiException {}

      const response = {} as ErrorResponseBody;
      const exception = new UnhandledException(response);

      await filter.catch(exception, mockHost);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_GATEWAY);
      expect(mockResponse.json).toHaveBeenCalledWith({
        cause: ExternalApiExceptionMessage.ExternalApiException,
      });
    });
  });
});

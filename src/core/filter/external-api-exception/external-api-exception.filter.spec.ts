import {
  ArgumentsHost,
  BadGatewayException,
  LoggerService,
} from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { ChatPostMessageResponse } from '@slack/web-api';
import { CoreToken, LoggerToken } from '@src/core/constant';
import {
  DuplicatedDataException,
  ErrorMessageBotException,
  SmsApiException,
  TmapApiException,
} from '@src/core/exception';
import { ErrorMessageBot, ErrorResponseBody } from '@src/core/module';
import { NaverSmsApiResponse } from '@src/core/module/external-api/sms-api/naver-sms-api.response';
import { mock } from 'jest-mock-extended';
import { ErrorMessageBotExceptionFilter } from './error-message-bot-exception/error-message-bot-exception.filter';
import { ExternalApiExceptionFilter } from './external-api-exception.filter';
import { SmsApiExceptionFilter } from './sms-api-exception/sms-api-exception.filter';
import { TmapApiExceptionFilter } from './tmap-api-exception/tmap-api-exception.filter';

describe('ExternalApiExceptionFilter', () => {
  let filter: ExternalApiExceptionFilter;

  const mockHost = mock<ArgumentsHost>();

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        ExternalApiExceptionFilter,
        ErrorMessageBotExceptionFilter,
        SmsApiExceptionFilter,
        TmapApiExceptionFilter,
        {
          provide: LoggerToken.ERROR_MESSAGE_BOT_EXCEPTION_LOGGER,
          useValue: mock<LoggerService>(),
        },
        {
          provide: LoggerToken.SMS_API_EXCEPTION_LOGGER,
          useValue: mock<LoggerService>(),
        },
        {
          provide: LoggerToken.TMAP_API_EXCEPTION_LOGGER,
          useValue: mock<LoggerService>(),
        },
        {
          provide: LoggerToken.UNKNOWN_DATABASE_EXCEPTION_LOGGER,
          useValue: mock<LoggerService>(),
        },
        {
          provide: CoreToken.ERROR_MESSAGE_BOT,
          useValue: mock<ErrorMessageBot>(),
        },
      ],
    }).compile();

    filter = module.get(ExternalApiExceptionFilter);
  });

  describe('catch', () => {
    test('통과하는 테스트, ErrorMessageBotError', async () => {
      const error = {} as ChatPostMessageResponse;
      const exception = new ErrorMessageBotException(error);

      await expect(filter.catch(exception, mockHost)).rejects.toEqual(
        new BadGatewayException(exception.message),
      );
    });

    test('통과하는 테스트, TmapApiError', async () => {
      const response = {} as ErrorResponseBody;
      const exception = new TmapApiException(response);

      await expect(filter.catch(exception, mockHost)).rejects.toEqual(
        new BadGatewayException(exception.message),
      );
    });

    test('통과하는 테스트, SmsApiError', async () => {
      const response = {} as NaverSmsApiResponse;
      const exception = new SmsApiException(response);

      await expect(filter.catch(exception, mockHost)).rejects.toEqual(
        new BadGatewayException(exception.message),
      );
    });

    test('실패하는 테스트, 담당이 아닌 에러', async () => {
      const exception = new DuplicatedDataException();

      await expect(filter.catch(exception, mockHost)).resolves.toEqual(
        undefined,
      );
    });
  });
});

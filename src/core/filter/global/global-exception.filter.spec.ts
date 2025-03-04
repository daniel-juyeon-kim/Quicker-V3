import {
  ArgumentsHost,
  BadGatewayException,
  ConflictException,
  InternalServerErrorException,
  LoggerService,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { CoreToken, LoggerToken } from '@src/core/constant';
import { DuplicatedDataException, SmsApiException } from '@src/core/exception';
import { UnknownDataBaseException } from '@src/core/exception/database/unknown-database.exception';
import { ErrorMessageBot } from '@src/core/module';
import { NaverSmsApiResponse } from '@src/core/module/external-api/sms-api/naver-sms-api.response';
import { mock } from 'jest-mock-extended';
import { DatabaseExceptionFilter } from '../database-exception/database-exception.filter';
import { ErrorMessageBotExceptionFilter } from '../external-api-exception/error-message-bot-exception/error-message-bot-exception.filter';
import { ExternalApiExceptionFilter } from '../external-api-exception/external-api-exception.filter';
import { SmsApiExceptionFilter } from '../external-api-exception/sms-api-exception/sms-api-exception.filter';
import { TmapApiExceptionFilter } from '../external-api-exception/tmap-api-exception/tmap-api-exception.filter';
import { GlobalExceptionFilter } from './global-exception.filter';

describe('GlobalExceptionFilter', () => {
  let filter: GlobalExceptionFilter;
  const mockHost = mock<ArgumentsHost>();
  const smsApi = mock<ErrorMessageBot>();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GlobalExceptionFilter,
        DatabaseExceptionFilter,
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
          useValue: smsApi,
        },
      ],
    }).compile();

    filter = module.get(GlobalExceptionFilter);
  });

  describe('catch', () => {
    test('데이터베이스 계층 에러 처리 테스트', async () => {
      const exception = new DuplicatedDataException();

      await expect(filter.catch(exception, mockHost)).rejects.toEqual(
        new ConflictException(exception.message),
      );
    });

    test('외부 api 에러 처리 테스트', async () => {
      const response = {} as NaverSmsApiResponse;
      const exception = new SmsApiException(response);

      await expect(filter.catch(exception, mockHost)).rejects.toEqual(
        new BadGatewayException(exception.message),
      );
    });

    test('알 수 없는 데이터베이스 에러 처리 테스트', async () => {
      const exception = new UnknownDataBaseException(new Error());

      await expect(filter.catch(exception, mockHost)).rejects.toStrictEqual(
        new InternalServerErrorException(exception.message),
      );
    });
  });
});

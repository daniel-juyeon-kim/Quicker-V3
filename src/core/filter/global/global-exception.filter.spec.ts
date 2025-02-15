import {
  ArgumentsHost,
  BadGatewayException,
  ConflictException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { CoreToken } from '@src/core/constant';
import {
  ErrorMessageBot,
  SmsApiException,
  UnknownDataBaseException,
} from '@src/core/module';
import { DuplicatedDataException } from '@src/database';
import { mock } from 'jest-mock-extended';
import { DatabaseExceptionFilter } from '../database-exception/database-exception.filter';
import { ErrorMessageBotExceptionFilter } from '../external-api-exception/error-message-bot-exception/error-message-bot-exception.filter';
import { ExternalApiExceptionFilter } from '../external-api-exception/external-api-exception.filter';
import { SmsApiExceptionFilter } from '../external-api-exception/sms-api-exception/sms-api-exception.filter';
import { TmapApiExceptionFilter } from '../external-api-exception/tmap-api-exception/tmap-api-exception.filter';
import { UnknownExceptionFilter } from '../unknown-exception/unknown-exception.filter';
import { GlobalExceptionFilter } from './global-exception.filter';

describe('GlobalExceptionFilter', () => {
  let filter: GlobalExceptionFilter;
  const mockHost = mock<ArgumentsHost>();
  const logger = mock<Logger>();
  const smsApi = mock<ErrorMessageBot>();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GlobalExceptionFilter,
        DatabaseExceptionFilter,
        UnknownExceptionFilter,
        ExternalApiExceptionFilter,
        ErrorMessageBotExceptionFilter,
        SmsApiExceptionFilter,
        TmapApiExceptionFilter,
        {
          provide: Logger,
          useValue: logger,
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
      const exception = new DuplicatedDataException('중복된 데이터입니다.');

      await expect(filter.catch(exception, mockHost)).rejects.toEqual(
        new ConflictException(exception.message),
      );
    });

    test('외부 api 에러 처리 테스트', async () => {
      const exception = new SmsApiException('sms api 에러');

      await expect(filter.catch(exception, mockHost)).rejects.toEqual(
        new BadGatewayException(exception.message),
      );
    });

    test('알 수 없는 에러 처리 테스트', async () => {
      const exception = new UnknownDataBaseException('알 수 없는 에러');

      await expect(filter.catch(exception, mockHost)).rejects.toEqual(
        new InternalServerErrorException(exception.message),
      );
    });
  });
});

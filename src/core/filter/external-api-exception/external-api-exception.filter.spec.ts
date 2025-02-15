import { ArgumentsHost, BadGatewayException, Logger } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { CoreToken } from '@src/core/constant';
import {
  ErrorMessageBot,
  ErrorMessageBotException,
  SmsApiException,
  TmapApiException,
} from '@src/core/module';
import { DuplicatedDataException } from '@src/database';
import { mock } from 'jest-mock-extended';
import { ErrorMessageBotExceptionFilter } from './error-message-bot-exception/error-message-bot-exception.filter';
import { ExternalApiExceptionFilter } from './external-api-exception.filter';
import { SmsApiExceptionFilter } from './sms-api-exception/sms-api-exception.filter';
import { TmapApiExceptionFilter } from './tmap-api-exception/tmap-api-exception.filter';

describe('ExternalApiExceptionFilter', () => {
  let filter: ExternalApiExceptionFilter;

  const logger = mock<Logger>();
  const errorMessageBot = mock<ErrorMessageBot>();

  const mockHost = mock<ArgumentsHost>();

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
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
          useValue: errorMessageBot,
        },
      ],
    }).compile();

    filter = module.get(ExternalApiExceptionFilter);
  });

  describe('catch', () => {
    test('통과하는 테스트, ErrorMessageBotError', async () => {
      const exception = new ErrorMessageBotException('오류');

      await expect(filter.catch(exception, mockHost)).rejects.toEqual(
        new BadGatewayException(exception.message),
      );
    });

    test('통과하는 테스트, TmapApiError', async () => {
      const exception = new TmapApiException('오류');

      await expect(filter.catch(exception, mockHost)).rejects.toEqual(
        new BadGatewayException(exception.message),
      );
    });

    test('통과하는 테스트, SmsApiError', async () => {
      const exception = new SmsApiException('오류');

      await expect(filter.catch(exception, mockHost)).rejects.toEqual(
        new BadGatewayException(exception.message),
      );
    });

    test('실패하는 테스트, 담당이 아닌 에러', async () => {
      const exception = new DuplicatedDataException('오류');

      await expect(filter.catch(exception, mockHost)).resolves.toEqual(
        undefined,
      );
    });
  });
});

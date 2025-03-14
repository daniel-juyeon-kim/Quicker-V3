import { LoggerService } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ChatPostMessageResponse } from '@slack/web-api';
import { LoggerToken } from '@src/core/constant';
import {
  AbstractUnknownException,
  ErrorMessageBotException,
  SmsApiException,
  TmapApiException,
} from '@src/core/exception';
import { UnknownExceptionConstructor } from '@src/core/exception/unknown/unknown-exception-constructor.interface';
import { TmapApiErrorResponseBody } from '@src/core/module';
import { NaverSmsApiResponse } from '@src/core/module/external-api/sms-api/naver-sms-api.response';
import { mock } from 'jest-mock-extended';
import { UnknownExceptionLoggerMap } from './unknown-exception-logger-map';

describe('UnknownExceptionLoggerMap', () => {
  let loggerMap: UnknownExceptionLoggerMap;

  const defaultLogger = mock<LoggerService>();
  const errorMessageBotExceptionLogger = mock<LoggerService>();
  const smsApiExceptionLogger = mock<LoggerService>();
  const tmapApiExceptionLogger = mock<LoggerService>();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UnknownExceptionLoggerMap,
        {
          provide: Map,
          useFactory: (
            errorMessageBotExceptionLogger: LoggerService,
            smsApiExceptionLogger: LoggerService,
            tmapApiExceptionLogger: LoggerService,
          ) => {
            return new Map<UnknownExceptionConstructor, LoggerService>([
              [ErrorMessageBotException, errorMessageBotExceptionLogger],
              [SmsApiException, smsApiExceptionLogger],
              [TmapApiException, tmapApiExceptionLogger],
            ]);
          },
          inject: [
            LoggerToken.ERROR_MESSAGE_BOT_EXCEPTION_LOGGER,
            LoggerToken.SMS_API_EXCEPTION_LOGGER,
            LoggerToken.TMAP_API_EXCEPTION_LOGGER,
          ],
        },
        {
          provide: LoggerToken.EXTERNAL_API_EXCEPTION_LOGGER,
          useValue: defaultLogger,
        },
        {
          provide: LoggerToken.ERROR_MESSAGE_BOT_EXCEPTION_LOGGER,
          useValue: errorMessageBotExceptionLogger,
        },
        {
          provide: LoggerToken.SMS_API_EXCEPTION_LOGGER,
          useValue: smsApiExceptionLogger,
        },
        {
          provide: LoggerToken.TMAP_API_EXCEPTION_LOGGER,
          useValue: tmapApiExceptionLogger,
        },
      ],
    }).compile();

    loggerMap = module.get<UnknownExceptionLoggerMap>(
      UnknownExceptionLoggerMap,
    );
  });

  describe('getLogger', () => {
    it('정의되지 않은 예외에 대해 기본 로거를 반환해야 한다', () => {
      class UndefinedException extends AbstractUnknownException<never> {
        protected error: never;
      }

      const exception = new UndefinedException('메시지', 404);

      const logger = loggerMap.getLogger(exception);

      expect(logger).toEqual(defaultLogger);
    });

    it('TmapApiException에 대해 TmapApiException 로거를 반환해야 한다', () => {
      const error = {} as TmapApiErrorResponseBody;
      const exception = new TmapApiException(error);

      const logger = loggerMap.getLogger(exception);

      expect(logger).toEqual(tmapApiExceptionLogger);
    });

    it('ErrorMessageBotException에 대해 ErrorMessageBotException 로거를 반환해야 한다', () => {
      const error = {} as ChatPostMessageResponse;
      const exception = new ErrorMessageBotException(error);

      const logger = loggerMap.getLogger(exception);

      expect(logger).toEqual(errorMessageBotExceptionLogger);
    });

    it('SmsApiException에 대해 SmsApiException 로거를 반환해야 한다', () => {
      const error = {} as NaverSmsApiResponse;
      const exception = new SmsApiException(error);

      const logger = loggerMap.getLogger(exception);

      expect(logger).toEqual(smsApiExceptionLogger);
    });
  });
});

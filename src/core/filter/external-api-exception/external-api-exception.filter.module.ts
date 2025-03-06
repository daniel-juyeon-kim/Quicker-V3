import { LoggerService, Module } from '@nestjs/common';
import { LoggerToken } from '@src/core/constant';
import {
  ErrorMessageBotException,
  ExternalApiException,
  SmsApiException,
  TmapApiException,
} from '@src/core/exception';
import { ExternalApiExceptionLoggerMap } from './external-api-exception-logger-map';

@Module({
  providers: [
    ExternalApiExceptionLoggerMap,
    {
      provide: Map,
      useFactory: (
        errorMessageBotExceptionLogger: LoggerService,
        smsApiExceptionLogger: LoggerService,
        tmapApiExceptionLogger: LoggerService,
      ) => {
        return new Map<typeof ExternalApiException, LoggerService>([
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
  ],
  exports: [ExternalApiExceptionLoggerMap],
})
export class ExternalApiExceptionFilterModule {}

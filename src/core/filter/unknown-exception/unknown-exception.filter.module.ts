import { LoggerService, Module } from '@nestjs/common';
import { LoggerToken } from '@src/core/constant';
import {
  ErrorMessageBotException,
  SmsApiException,
  TmapApiException,
  UnknownDataBaseException,
} from '@src/core/exception';
import { UnknownExceptionConstructor } from '@src/core/exception/unknown/unknown-exception-constructor.interface';
import { UnknownExceptionLoggerMap } from './unknown-exception-logger-map';

@Module({
  providers: [
    UnknownExceptionLoggerMap,
    {
      provide: Map,
      useFactory: (
        errorMessageBotExceptionLogger: LoggerService,
        smsApiExceptionLogger: LoggerService,
        tmapApiExceptionLogger: LoggerService,
        unknownDataBaseExceptionLogger: LoggerService,
      ) => {
        return new Map<UnknownExceptionConstructor, LoggerService>([
          [ErrorMessageBotException, errorMessageBotExceptionLogger],
          [SmsApiException, smsApiExceptionLogger],
          [TmapApiException, tmapApiExceptionLogger],
          [UnknownDataBaseException, unknownDataBaseExceptionLogger],
        ]);
      },
      inject: [
        LoggerToken.ERROR_MESSAGE_BOT_EXCEPTION_LOGGER,
        LoggerToken.SMS_API_EXCEPTION_LOGGER,
        LoggerToken.TMAP_API_EXCEPTION_LOGGER,
        LoggerToken.UNKNOWN_DATABASE_EXCEPTION_LOGGER,
      ],
    },
  ],
  exports: [UnknownExceptionLoggerMap],
})
export class UnknownExceptionFilterModule {}

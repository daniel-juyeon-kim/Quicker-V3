import { Module, Provider } from '@nestjs/common';
import { LoggerToken } from '@src/core/constant';
import { WinstonModule } from 'nest-winston';
import DailyRotateFile from 'winston-daily-rotate-file';

const createLoggerProvider = (token: string, dirName: string): Provider => ({
  provide: token,
  useValue: WinstonModule.createLogger({
    transports: new DailyRotateFile({
      filename: '%DATE%.error.log',
      datePattern: 'YYYY-MM-DD',
      dirname: dirName,
    }),
  }),
});

const loggers: Provider[] = [
  createLoggerProvider(
    LoggerToken.ERROR_MESSAGE_BOT_EXCEPTION_LOGGER,
    'error-logs/errorMessageBot',
  ),
  createLoggerProvider(
    LoggerToken.SMS_API_EXCEPTION_LOGGER,
    'error-logs/sms-api',
  ),
  createLoggerProvider(
    LoggerToken.EXTERNAL_API_EXCEPTION_LOGGER,
    'error-logs/external-api',
  ),
  createLoggerProvider(
    LoggerToken.TMAP_API_EXCEPTION_LOGGER,
    'error-logs/tmap-api',
  ),
  createLoggerProvider(
    LoggerToken.UNKNOWN_DATABASE_EXCEPTION_LOGGER,
    'error-logs/unknown',
  ),
  createLoggerProvider(
    LoggerToken.GLOBAL_EXCEPTION_LOGGER,
    'error-logs/global',
  ),
];

@Module({
  providers: loggers,
  exports: loggers,
})
export class FilterLoggersModule {}

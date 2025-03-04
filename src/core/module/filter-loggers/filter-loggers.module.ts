import { Module, Provider } from '@nestjs/common';
import { LoggerToken } from '@src/core/constant';
import { WinstonModule } from 'nest-winston';
import DailyRotateFile from 'winston-daily-rotate-file';

const loggers: Provider[] = [
  {
    provide: LoggerToken.ERROR_MESSAGE_BOT_EXCEPTION_LOGGER,
    useValue: WinstonModule.createLogger({
      transports: new DailyRotateFile({
        filename: '%DATE%.error.log',
        datePattern: 'YYYY-MM-DD',
        dirname: 'error-logs/errorMessageBot',
      }),
    }),
  },
  {
    provide: LoggerToken.SMS_API_EXCEPTION_LOGGER,
    useValue: WinstonModule.createLogger({
      transports: new DailyRotateFile({
        filename: '%DATE%.error.log',
        datePattern: 'YYYY-MM-DD',
        dirname: 'error-logs/sms-api',
      }),
    }),
  },
  {
    provide: LoggerToken.TMAP_API_EXCEPTION_LOGGER,
    useValue: WinstonModule.createLogger({
      transports: new DailyRotateFile({
        filename: '%DATE%.error.log',
        datePattern: 'YYYY-MM-DD',
        dirname: 'error-logs/tmap-api',
      }),
    }),
  },
  {
    provide: LoggerToken.UNKNOWN_DATABASE_EXCEPTION_LOGGER,
    useValue: WinstonModule.createLogger({
      transports: new DailyRotateFile({
        filename: '%DATE%.error.log',
        datePattern: 'YYYY-MM-DD',
        dirname: 'error-logs/unknown',
      }),
    }),
  },
];

@Module({
  providers: loggers,
  exports: loggers,
})
export class FilterLoggersModule {}

import { Inject, Injectable, LoggerService } from '@nestjs/common';
import { LoggerToken } from '@src/core/constant';
import { ExternalApiException } from '@src/core/exception';
import { isUndefined } from '@src/core/util';

@Injectable()
export class ExternalApiExceptionLoggerMap {
  constructor(
    @Inject(LoggerToken.EXTERNAL_API_EXCEPTION_LOGGER)
    private readonly defaultLogger: LoggerService,
    private readonly loggerMap: Map<typeof ExternalApiException, LoggerService>,
  ) {}

  getLogger(exception: ExternalApiException) {
    const logger = this.loggerMap.get(
      exception.constructor as typeof ExternalApiException,
    );

    if (isUndefined(logger)) {
      return this.defaultLogger;
    }
    return logger;
  }
}

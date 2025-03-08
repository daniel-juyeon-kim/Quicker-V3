import { Inject, Injectable, LoggerService } from '@nestjs/common';
import { LoggerToken } from '@src/core/constant';
import { UnknownException } from '@src/core/exception';
import { isUndefined } from '@src/core/util';

@Injectable()
export class UnknownExceptionLoggerMap {
  constructor(
    @Inject(LoggerToken.EXTERNAL_API_EXCEPTION_LOGGER)
    private readonly defaultLogger: LoggerService,
    private readonly loggerMap: Map<typeof UnknownException, LoggerService>,
  ) {}

  getLogger(exception: UnknownException) {
    const logger = this.loggerMap.get(
      exception.constructor as typeof UnknownException,
    );

    if (isUndefined(logger)) {
      return this.defaultLogger;
    }
    return logger;
  }
}

import { Inject, Injectable, LoggerService } from '@nestjs/common';
import { LoggerToken } from '@src/core/constant';
import { AbstractUnknownException } from '@src/core/exception';
import { UnknownExceptionConstructor } from '@src/core/exception/unknown/unknown-exception-constructor.interface';
import { isUndefined } from '@src/core/util';

@Injectable()
export class UnknownExceptionLoggerMap {
  constructor(
    @Inject(LoggerToken.EXTERNAL_API_EXCEPTION_LOGGER)
    private readonly defaultLogger: LoggerService,
    private readonly loggerMap: Map<UnknownExceptionConstructor, LoggerService>,
  ) {}

  getLogger(exception: AbstractUnknownException<unknown>) {
    const logger = this.loggerMap.get(
      exception.constructor as UnknownExceptionConstructor,
    );

    if (isUndefined(logger)) {
      return this.defaultLogger;
    }
    return logger;
  }
}

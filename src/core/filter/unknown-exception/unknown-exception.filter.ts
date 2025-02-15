import {
  ArgumentsHost,
  Catch,
  Inject,
  InternalServerErrorException,
  LoggerService,
} from '@nestjs/common';
import { LoggerToken } from '@src/core/constant';
import { ErrorMessage, UnknownException } from '@src/core/module';
import { CustomException } from '@src/core/module/exception/custom.exception';
import { ErrorReportExceptionFilter } from '../abstract/abstract-exception.filter';
import { ExceptionTypes } from '../interface/exception-types';

@Catch()
export class UnknownExceptionFilter extends ErrorReportExceptionFilter<CustomException> {
  constructor(
    @Inject(LoggerToken.UNKNOWN_EXCEPTION_LOGGER)
    protected readonly logger: LoggerService,
  ) {
    super();
  }

  async catch(exception: CustomException, host: ArgumentsHost) {
    if (exception instanceof UnknownException) {
      const date = new Date();

      await this.sendSlackMessage({ exception, date });
      this.logger.log(exception);

      throw new InternalServerErrorException();
    }
  }

  private async sendSlackMessage({
    date,
    exception,
  }: {
    date: Date;
    exception: ExceptionTypes;
  }) {
    try {
      const errorMessage = new ErrorMessage({ date, exception });

      await this.errorMessageBot.sendMessage(errorMessage);
    } catch (exception) {
      this.logger.log(exception);
    }
  }
}

import {
  ArgumentsHost,
  Catch,
  InternalServerErrorException,
} from '@nestjs/common';
import { ErrorMessage, UnknownException } from '@src/core/module';
import { CustomException } from '@src/core/module/exception/custom.exception';
import { AbstractExceptionFilter } from '../abstract-exception.filter';
import { ExceptionTypes } from '../interface/exception-types';

@Catch()
export class UnknownExceptionFilter extends AbstractExceptionFilter<CustomException> {
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

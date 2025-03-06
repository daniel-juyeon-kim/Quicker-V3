import { ArgumentsHost, ExceptionFilter } from '@nestjs/common';
import { CustomException } from '@src/core/exception/custom.exception';
import { ErrorMessage, ErrorMessageBot } from '@src/core/module';

export abstract class AbstractExceptionFilter<T> implements ExceptionFilter<T> {
  protected abstract readonly errorMessageBot: ErrorMessageBot;

  abstract catch(exception: T, host: ArgumentsHost): any;

  protected async sendErrorMessageBySlack({
    exception,
    date,
  }: {
    exception: CustomException;
    date: Date;
  }) {
    const errorMessage = new ErrorMessage({ date, exception });
    await this.errorMessageBot.sendMessage(errorMessage);
  }
}

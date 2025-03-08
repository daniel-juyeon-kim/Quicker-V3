import { BaseExceptionFilter } from '@nestjs/core';
import { CustomException } from '@src/core/exception/custom.exception';
import { ErrorMessage, ErrorMessageBot } from '@src/core/module';

export abstract class AbstractExceptionFilter<
  T,
> extends BaseExceptionFilter<T> {
  protected abstract readonly errorMessageBot: ErrorMessageBot;

  protected async sendErrorMessageBySlack(exception: CustomException) {
    const date = new Date();

    const errorMessage = new ErrorMessage({ date, exception });
    await this.errorMessageBot.sendMessage(errorMessage);
  }
}

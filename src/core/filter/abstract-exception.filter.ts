import { ArgumentsHost, ExceptionFilter, Inject, Logger } from '@nestjs/common';
import { ErrorMessage, ErrorMessageBot } from '@src/core/module';
import { CoreToken } from '../constant';
import { CustomException } from '../module/exception/custom.exception';

export abstract class AbstractExceptionFilter<T> implements ExceptionFilter<T> {
  @Inject(Logger)
  protected readonly logger: Logger;
  @Inject(CoreToken.ERROR_MESSAGE_BOT)
  protected readonly errorMessageBot: ErrorMessageBot;

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

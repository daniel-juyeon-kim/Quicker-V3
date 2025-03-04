import {
  ArgumentsHost,
  ExceptionFilter,
  Inject,
  LoggerService,
} from '@nestjs/common';
import { CoreToken } from '@src/core/constant';
import { CustomException } from '@src/core/exception/custom.exception';
import { ErrorMessage, ErrorMessageBot } from '@src/core/module';

export abstract class ErrorReportExceptionFilter<T>
  implements ExceptionFilter<T>
{
  protected abstract readonly logger: LoggerService;
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

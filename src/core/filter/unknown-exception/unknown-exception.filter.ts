import { ArgumentsHost, Catch, Inject } from '@nestjs/common';
import { CoreToken } from '@src/core/constant';
import {
  ErrorMessageBotException,
  UnknownException,
} from '@src/core/exception';
import { ErrorMessageBot } from '@src/core/module';
import { Response } from 'express';
import { AbstractExceptionFilter } from '../abstract/abstract-exception.filter';
import { UnknownExceptionLoggerMap } from './unknown-exception-logger-map';

@Catch(UnknownException)
export class UnknownExceptionFilter extends AbstractExceptionFilter<UnknownException> {
  constructor(
    @Inject(CoreToken.ERROR_MESSAGE_BOT)
    protected readonly errorMessageBot: ErrorMessageBot,
    private readonly loggerMap: UnknownExceptionLoggerMap,
  ) {
    super();
  }

  async catch(exception: UnknownException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();

    await this.handleExternalApiException(exception);

    res.status(exception.getStatus()).json(exception.getResponse());
  }

  private async handleExternalApiException(exception: UnknownException) {
    const logger = this.loggerMap.getLogger(exception);
    logger.log(exception);

    if (this.isErrorMessageBotException(exception)) {
      return;
    }

    await this.sendErrorMessageBySlack(exception);
  }

  private isErrorMessageBotException(exception: UnknownException) {
    return exception instanceof ErrorMessageBotException;
  }
}

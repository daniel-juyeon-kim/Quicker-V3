import { ArgumentsHost, Catch, Inject } from '@nestjs/common';
import { CoreToken } from '@src/core/constant';
import {
  AbstractUnknownException,
  ErrorMessageBotException,
} from '@src/core/exception';
import { ErrorMessageBot } from '@src/core/module';
import { Response } from 'express';
import { AbstractExceptionFilter } from '../abstract/abstract-exception.filter';
import { UnknownExceptionLoggerMap } from './unknown-exception-logger-map';

@Catch(AbstractUnknownException)
export class UnknownExceptionFilter extends AbstractExceptionFilter<
  AbstractUnknownException<unknown>
> {
  constructor(
    @Inject(CoreToken.ERROR_MESSAGE_BOT)
    protected readonly errorMessageBot: ErrorMessageBot,
    private readonly loggerMap: UnknownExceptionLoggerMap,
  ) {
    super();
  }

  async catch(
    exception: AbstractUnknownException<unknown>,
    host: ArgumentsHost,
  ) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();

    await this.handleExternalApiException(exception);

    res.status(exception.getStatus()).json(exception.getResponse());
  }

  private async handleExternalApiException(
    exception: AbstractUnknownException<unknown>,
  ) {
    try {
      const logger = this.loggerMap.getLogger(exception);
      logger.log(exception);

      if (this.isErrorMessageBotException(exception)) {
        return;
      }

      await this.sendErrorMessageBySlack(exception);
    } catch (e) {
      const error = e as ErrorMessageBotException;

      const logger = this.loggerMap.getLogger(error);
      logger.log(exception);
    }
  }

  private isErrorMessageBotException(
    exception: AbstractUnknownException<unknown>,
  ) {
    return exception instanceof ErrorMessageBotException;
  }
}

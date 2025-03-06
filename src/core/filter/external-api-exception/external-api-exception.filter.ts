import { ArgumentsHost, Catch, HttpStatus, Inject } from '@nestjs/common';
import { CoreToken } from '@src/core/constant';
import {
  ErrorMessageBotException,
  ExternalApiException,
} from '@src/core/exception';
import { ErrorMessageBot } from '@src/core/module';
import { Response } from 'express';
import { AbstractExceptionFilter } from '../abstract/abstract-exception.filter';
import { ExternalApiExceptionLoggerMap } from './external-api-exception-logger-map';

@Catch(ExternalApiException)
export class ExternalApiExceptionFilter extends AbstractExceptionFilter<ExternalApiException> {
  constructor(
    @Inject(CoreToken.ERROR_MESSAGE_BOT)
    protected readonly errorMessageBot: ErrorMessageBot,
    private readonly loggerMap: ExternalApiExceptionLoggerMap,
  ) {
    super();
  }

  async catch(exception: ExternalApiException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();
    const responseBody = exception.createResponseBody();

    await this.handleExternalApiException(exception);

    res.status(HttpStatus.BAD_GATEWAY).json(responseBody);
  }

  private async handleExternalApiException(exception: ExternalApiException) {
    const logger = this.loggerMap.getLogger(exception);
    logger.log(exception);

    if (!this.isErrorMessageBotException(exception)) {
      const date = new Date();
      await this.sendErrorMessageBySlack({ exception, date });
    }
  }

  private isErrorMessageBotException(exception: ExternalApiException) {
    return exception instanceof ErrorMessageBotException;
  }
}

import {
  ArgumentsHost,
  Catch,
  HttpException,
  HttpStatus,
  Inject,
  LoggerService,
} from '@nestjs/common';
import { CoreToken, LoggerToken } from '@src/core/constant';
import { ErrorMessageBot } from '@src/core/module';
import { Response } from 'express';
import { AbstractExceptionFilter } from '../abstract/abstract-exception.filter';

@Catch()
export class GlobalExceptionFilter extends AbstractExceptionFilter<HttpException> {
  constructor(
    @Inject(CoreToken.ERROR_MESSAGE_BOT)
    protected errorMessageBot: ErrorMessageBot,
    @Inject(LoggerToken.GLOBAL_EXCEPTION_LOGGER)
    private logger: LoggerService,
  ) {
    super();
  }

  async catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();

    if (exception instanceof HttpException) {
      super.catch(exception, host);
      return;
    }

    this.logger.log(exception);
    await this.sendErrorMessageBySlack(exception);

    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json();
  }
}

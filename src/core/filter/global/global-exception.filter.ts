import {
  ArgumentsHost,
  Catch,
  HttpStatus,
  Inject,
  LoggerService,
} from '@nestjs/common';
import { CoreToken, LoggerToken } from '@src/core/constant';
import { CustomException } from '@src/core/exception/custom.exception';
import { ErrorMessageBot } from '@src/core/module';
import { Response } from 'express';
import { AbstractExceptionFilter } from '../abstract/abstract-exception.filter';

@Catch()
export class GlobalExceptionFilter extends AbstractExceptionFilter<CustomException> {
  constructor(
    @Inject(CoreToken.ERROR_MESSAGE_BOT)
    protected errorMessageBot: ErrorMessageBot,
    @Inject(LoggerToken.GLOBAL_EXCEPTION_LOGGER)
    private logger: LoggerService,
  ) {
    super();
  }

  async catch(exception: CustomException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();
    const responseBody = exception.createResponseBody();

    this.logger.log(exception);

    const date = new Date();
    await this.sendErrorMessageBySlack({ date, exception });

    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(responseBody);
  }
}

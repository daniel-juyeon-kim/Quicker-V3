import { ArgumentsHost, Catch, Inject, LoggerService } from '@nestjs/common';
import { CoreToken, LoggerToken } from '@src/core/constant';
import { DataBaseException } from '@src/core/exception';
import { ErrorMessageBot } from '@src/core/module';
import { Response } from 'express';
import { AbstractExceptionFilter } from '../abstract/abstract-exception.filter';
import { DatabaseExceptionHttpStatusMap } from './database-exception-http-status-map';

@Catch(DataBaseException)
export class DatabaseExceptionFilter extends AbstractExceptionFilter<DataBaseException> {
  constructor(
    @Inject(LoggerToken.UNKNOWN_DATABASE_EXCEPTION_LOGGER)
    protected readonly logger: LoggerService,
    @Inject(CoreToken.ERROR_MESSAGE_BOT)
    protected readonly errorMessageBot: ErrorMessageBot,
    private readonly exceptionHttpStatusMap: DatabaseExceptionHttpStatusMap,
  ) {
    super();
  }

  async catch(exception: DataBaseException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();
    const resBody = exception.createResponseBody();

    const status = this.exceptionHttpStatusMap.getHttpStatus(exception);

    await this.handleUnknownException(exception);

    res.status(status).json(resBody);
  }

  private async handleUnknownException(exception: DataBaseException) {
    if (!this.exceptionHttpStatusMap.isUnknownException(exception)) {
      return;
    }

    this.logger.log(exception);

    const date = new Date();
    await this.sendErrorMessageBySlack({ exception, date });
  }
}

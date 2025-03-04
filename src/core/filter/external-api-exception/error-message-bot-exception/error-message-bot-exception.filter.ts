import { ArgumentsHost, Catch, Inject, LoggerService } from '@nestjs/common';
import { LoggerToken } from '@src/core/constant';
import {
  ErrorMessageBotException,
  ExternalApiException,
} from '@src/core/exception';
import { ErrorReportExceptionFilter } from '../../abstract/abstract-exception.filter';

@Catch()
export class ErrorMessageBotExceptionFilter extends ErrorReportExceptionFilter<ExternalApiException> {
  constructor(
    @Inject(LoggerToken.ERROR_MESSAGE_BOT_EXCEPTION_LOGGER)
    protected readonly logger: LoggerService,
  ) {
    super();
  }

  catch(exception: ExternalApiException, host: ArgumentsHost) {
    if (exception instanceof ErrorMessageBotException) {
      this.logger.log(exception);
    }
  }
}

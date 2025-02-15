import { ArgumentsHost, Catch, Inject, LoggerService } from '@nestjs/common';
import { LoggerToken } from '@src/core/constant';
import { ExternalApiException, SmsApiException } from '@src/core/module';
import { ErrorReportExceptionFilter } from '../../abstract/abstract-exception.filter';

@Catch()
export class SmsApiExceptionFilter extends ErrorReportExceptionFilter<ExternalApiException> {
  constructor(
    @Inject(LoggerToken.SMS_API_EXCEPTION_LOGGER)
    protected readonly logger: LoggerService,
  ) {
    super();
  }

  async catch(exception: ExternalApiException, host: ArgumentsHost) {
    if (exception instanceof SmsApiException) {
      const date = new Date();

      await this.sendErrorMessageBySlack({ exception, date });
      this.logger.log(exception);
    }
  }
}

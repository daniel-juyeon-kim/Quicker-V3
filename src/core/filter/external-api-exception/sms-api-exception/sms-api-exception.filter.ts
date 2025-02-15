import { ArgumentsHost, Catch } from '@nestjs/common';
import { ExternalApiException, SmsApiException } from '@src/core/module';
import { AbstractExceptionFilter } from '../../abstract-exception.filter';

@Catch()
export class SmsApiExceptionFilter extends AbstractExceptionFilter<ExternalApiException> {
  async catch(exception: ExternalApiException, host: ArgumentsHost) {
    if (exception instanceof SmsApiException) {
      const date = new Date();

      await this.sendErrorMessageBySlack({ exception, date });
      this.logger.log(exception);
    }
  }
}

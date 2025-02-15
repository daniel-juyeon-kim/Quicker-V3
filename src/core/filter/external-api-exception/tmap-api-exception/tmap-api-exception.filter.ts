import { ArgumentsHost, Catch } from '@nestjs/common';
import { ExternalApiException, TmapApiException } from '@src/core/module';
import { AbstractExceptionFilter } from '../../abstract-exception.filter';

@Catch()
export class TmapApiExceptionFilter extends AbstractExceptionFilter<ExternalApiException> {
  async catch(exception: ExternalApiException, host: ArgumentsHost) {
    if (exception instanceof TmapApiException) {
      const date = new Date();

      await this.sendErrorMessageBySlack({ date, exception });
      this.logger.log(exception);
    }
  }
}

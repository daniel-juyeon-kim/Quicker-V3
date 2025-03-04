import { ArgumentsHost, Catch, Inject, LoggerService } from '@nestjs/common';
import { LoggerToken } from '@src/core/constant';
import { ErrorReportExceptionFilter } from '../../abstract/abstract-exception.filter';
import { ExternalApiException, TmapApiException } from '@src/core/exception';

@Catch()
export class TmapApiExceptionFilter extends ErrorReportExceptionFilter<ExternalApiException> {
  constructor(
    @Inject(LoggerToken.TMAP_API_EXCEPTION_LOGGER)
    protected readonly logger: LoggerService,
  ) {
    super();
  }

  async catch(exception: ExternalApiException, host: ArgumentsHost) {
    if (exception instanceof TmapApiException) {
      const date = new Date();

      await this.sendErrorMessageBySlack({ date, exception });
      this.logger.log(exception);
    }
  }
}

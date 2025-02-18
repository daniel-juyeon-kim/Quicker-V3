import {
  ArgumentsHost,
  BadGatewayException,
  Catch,
  ExceptionFilter,
} from '@nestjs/common';
import { ExternalApiException } from '@src/core/module';
import { CustomException } from '@src/core/module/exception/custom.exception';
import { ErrorMessageBotExceptionFilter } from './error-message-bot-exception/error-message-bot-exception.filter';
import { SmsApiExceptionFilter } from './sms-api-exception/sms-api-exception.filter';
import { TmapApiExceptionFilter } from './tmap-api-exception/tmap-api-exception.filter';

@Catch()
export class ExternalApiExceptionFilter
  implements ExceptionFilter<CustomException>
{
  constructor(
    private readonly errorMessageBotExceptionFilter: ErrorMessageBotExceptionFilter,
    private readonly smsApiExceptionFilter: SmsApiExceptionFilter,
    private readonly tmapApiExceptionFilter: TmapApiExceptionFilter,
  ) {}

  async catch(exception: CustomException, host: ArgumentsHost) {
    if (exception instanceof ExternalApiException) {
      this.errorMessageBotExceptionFilter.catch(exception, host);
      await this.smsApiExceptionFilter.catch(exception, host);
      await this.tmapApiExceptionFilter.catch(exception, host);

      throw new BadGatewayException(exception.message);
    }
  }
}

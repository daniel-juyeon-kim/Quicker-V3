import {
  ArgumentsHost,
  BadGatewayException,
  Catch,
  ExceptionFilter,
} from '@nestjs/common';
import { ErrorMessageBotExceptionFilter } from './error-message-bot-exception/error-message-bot-exception.filter';
import { SmsApiExceptionFilter } from './sms-api-exception/sms-api-exception.filter';
import { TmapApiExceptionFilter } from './tmap-api-exception/tmap-api-exception.filter';
import { ExternalApiException } from '@src/core/exception';
import { CustomException } from '@src/core/exception/custom.exception';

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

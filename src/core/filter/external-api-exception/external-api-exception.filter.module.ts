import { Module } from '@nestjs/common';
import { ErrorMessageBotExceptionFilter } from './error-message-bot-exception/error-message-bot-exception.filter';
import { ExternalApiExceptionFilter } from './external-api-exception.filter';
import { SmsApiExceptionFilter } from './sms-api-exception/sms-api-exception.filter';
import { TmapApiExceptionFilter } from './tmap-api-exception/tmap-api-exception.filter';

@Module({
  providers: [
    ExternalApiExceptionFilter,
    ErrorMessageBotExceptionFilter,
    SmsApiExceptionFilter,
    TmapApiExceptionFilter,
  ],
  exports: [ExternalApiExceptionFilter],
})
export class ExternalApiExceptionFilterModule {}

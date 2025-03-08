import { HttpStatus } from '@nestjs/common';
import { ExternalApiExceptionMessage } from '@src/core/constant/exception-message/external-api.enum';
import { NaverSmsApiResponse } from '@src/core/module/external-api/sms-api/naver-sms-api.response';
import { UnknownException } from './unknown.exception';

export class SmsApiException extends UnknownException {
  private static readonly statusCode: HttpStatus = HttpStatus.BAD_GATEWAY;

  constructor(
    error: NaverSmsApiResponse,
    message: string = ExternalApiExceptionMessage.SmsApiException,
  ) {
    super(error, message, SmsApiException.statusCode);
  }
}

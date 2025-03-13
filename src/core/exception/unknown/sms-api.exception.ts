import { HttpStatus } from '@nestjs/common';
import { ExternalApiExceptionMessage } from '@src/core/constant/exception-message/external-api.enum';
import { NaverSmsApiResponse } from '@src/core/module/external-api/sms-api/naver-sms-api.response';
import { AbstractUnknownException } from './unknown.exception';

export class SmsApiException extends AbstractUnknownException<NaverSmsApiResponse> {
  private static readonly code: HttpStatus = HttpStatus.BAD_GATEWAY;
  protected readonly error: NaverSmsApiResponse;

  constructor(
    error: NaverSmsApiResponse,
    message: string = ExternalApiExceptionMessage.SmsApiException,
  ) {
    super(message, SmsApiException.code);
    this.error = error;
  }
}

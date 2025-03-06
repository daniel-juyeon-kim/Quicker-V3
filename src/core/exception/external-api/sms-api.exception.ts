import { ExternalApiExceptionMessage } from '@src/core/constant/exception-message/external-api.enum';
import { NaverSmsApiResponse } from '@src/core/module/external-api/sms-api/naver-sms-api.response';
import { ExternalApiException } from './external-api.exception';

export class SmsApiException extends ExternalApiException {
  constructor(
    error: NaverSmsApiResponse,
    target?: string,
    value?: string | number,
    cause: string = ExternalApiExceptionMessage.SmsApiException,
  ) {
    super(error, target, value, cause);
  }
}

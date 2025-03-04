import { ChatPostMessageResponse } from '@slack/web-api';
import { ExternalApiExceptionMessage } from '@src/core/constant/exception-message/external-api.enum';
import { ErrorResponseBody } from '@src/core/module';
import { NaverSmsApiResponse } from '@src/core/module/external-api/sms-api/naver-sms-api.response';
import { CustomException } from '../custom.exception';

export abstract class ExternalApiException extends CustomException {
  constructor(
    public readonly error:
      | ChatPostMessageResponse
      | NaverSmsApiResponse
      | ErrorResponseBody,
    public readonly target?: string,
    public readonly value?: string | number,
    public readonly cause: string = ExternalApiExceptionMessage.ExternalApiException,
  ) {
    super();
  }
}

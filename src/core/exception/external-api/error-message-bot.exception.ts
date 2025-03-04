import { ChatPostMessageResponse } from '@slack/web-api';
import { ExternalApiExceptionMessage } from '@src/core/constant/exception-message/external-api.enum';
import { ExternalApiException } from './external-api.exception';

export class ErrorMessageBotException extends ExternalApiException {
  constructor(
    error: ChatPostMessageResponse,
    target?: string,
    value?: string | number,
    cause: string = ExternalApiExceptionMessage.ErrorMessageBotException,
  ) {
    super(error, target, value, cause);
  }
}

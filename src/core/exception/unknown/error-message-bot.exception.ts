import { HttpStatus } from '@nestjs/common';
import { ChatPostMessageResponse } from '@slack/web-api';
import { ExternalApiExceptionMessage } from '@src/core/constant/exception-message/external-api.enum';
import { UnknownException } from './unknown.exception';

export class ErrorMessageBotException extends UnknownException {
  private static readonly statusCode: HttpStatus = HttpStatus.BAD_GATEWAY;

  constructor(
    error: ChatPostMessageResponse,
    message: string = ExternalApiExceptionMessage.ErrorMessageBotException,
  ) {
    super(error, message, ErrorMessageBotException.statusCode);
  }
}

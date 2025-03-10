import { HttpStatus } from '@nestjs/common';
import { ChatPostMessageResponse } from '@slack/web-api';
import { ExternalApiExceptionMessage } from '@src/core/constant/exception-message/external-api.enum';
import { AbstractUnknownException } from './unknown.exception';

export class ErrorMessageBotException extends AbstractUnknownException<ChatPostMessageResponse> {
  private static readonly code: HttpStatus = HttpStatus.BAD_GATEWAY;
  protected readonly error: ChatPostMessageResponse;

  constructor(
    error: ChatPostMessageResponse,
    message: string = ExternalApiExceptionMessage.ErrorMessageBotException,
  ) {
    super(message, ErrorMessageBotException.code);
    this.error = error;
  }
}

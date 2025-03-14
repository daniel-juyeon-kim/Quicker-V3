import { HttpStatus } from '@nestjs/common';
import { ExternalApiExceptionMessage } from '@src/core/constant/exception-message/external-api.enum';
import { TmapApiErrorResponseBody } from '@src/core/module';
import { AbstractUnknownException } from './unknown.exception';

export class TmapApiException extends AbstractUnknownException<TmapApiErrorResponseBody> {
  private static readonly code: HttpStatus = HttpStatus.BAD_GATEWAY;
  protected readonly error: TmapApiErrorResponseBody;

  constructor(
    error: TmapApiErrorResponseBody,
    message: string = ExternalApiExceptionMessage.TmapApiException,
  ) {
    super(message, TmapApiException.code);
    this.error = error;
  }
}

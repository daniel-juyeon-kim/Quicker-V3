import { HttpStatus } from '@nestjs/common';
import { ExternalApiExceptionMessage } from '@src/core/constant/exception-message/external-api.enum';
import { ErrorResponseBody } from '@src/core/module';
import { UnknownException } from './unknown.exception';

export class TmapApiException extends UnknownException {
  private static readonly statusCode: HttpStatus = HttpStatus.BAD_GATEWAY;

  constructor(
    error: ErrorResponseBody,
    message: string = ExternalApiExceptionMessage.TmapApiException,
  ) {
    super(error, message, TmapApiException.statusCode);
  }
}

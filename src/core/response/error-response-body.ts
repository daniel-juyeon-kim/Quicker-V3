import { HttpStatus } from '@nestjs/common';
import { BaseResponseBody } from './base-response-body';

export class ErrorResponseBody<T> extends BaseResponseBody {
  constructor(
    code: HttpStatus,
    message: string,
    readonly error?: T,
  ) {
    super(code, message);
  }
}

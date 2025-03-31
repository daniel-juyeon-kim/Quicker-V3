import { HttpStatus } from '@nestjs/common';
import { BaseResponseBody } from './base-response-body';

export class ErrorResponseBody<T> extends BaseResponseBody {
  readonly error?: T;

  constructor(code: HttpStatus, message: string, error?: T) {
    super(code, message);
    this.error = error;
  }
}

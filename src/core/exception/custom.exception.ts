import { HttpException, HttpStatus } from '@nestjs/common';
import { ErrorResponseBody } from '../response/error-response-body';

export abstract class CustomException<T> extends HttpException {
  protected abstract readonly error: T;

  constructor(message: string, code: HttpStatus) {
    super(message, code);
  }

  getResponse(): ErrorResponseBody<T> {
    return new ErrorResponseBody(this.getStatus(), this.message, this.error);
  }
}

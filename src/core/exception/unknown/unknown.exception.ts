import { ErrorResponseBody } from '@src/core/response';
import { CustomException } from '../custom.exception';

export abstract class AbstractUnknownException<T> extends CustomException<T> {
  protected abstract readonly error: T;

  getResponse(): ErrorResponseBody<undefined> {
    return new ErrorResponseBody(this.getStatus(), this.message);
  }
}

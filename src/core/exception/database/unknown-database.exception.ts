import { UnknownException } from '../unknown/unknown.exception';

export class UnknownDataBaseException<T> extends UnknownException {
  constructor(private readonly error: T) {
    super();
  }
}

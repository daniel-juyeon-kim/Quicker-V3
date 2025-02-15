import { CustomException } from './custom.exception';

export abstract class UnknownException extends CustomException {
  constructor(public readonly unknownError: unknown) {
    super();
  }
}

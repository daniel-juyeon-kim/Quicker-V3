import { ExternalApiException } from './external-api.exception';

export class ErrorMessageBotException extends ExternalApiException {
  constructor(public readonly error: unknown) {
    super();
  }
}

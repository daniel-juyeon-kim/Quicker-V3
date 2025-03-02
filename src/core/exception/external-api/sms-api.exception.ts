import { ExternalApiException } from './external-api.exception';

export class SmsApiException extends ExternalApiException {
  constructor(public readonly error: unknown) {
    super();
  }
}

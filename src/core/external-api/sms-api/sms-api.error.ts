import { ExternalApiError } from '../external-api.error';

export class SmsApiError<T> extends ExternalApiError {
  constructor(public readonly error: T) {
    super();
  }
}

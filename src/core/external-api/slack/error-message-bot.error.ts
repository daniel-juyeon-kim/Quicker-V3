import { ExternalApiError } from "../external-api.error";

export class ErrorMessageBotError<T> extends ExternalApiError {
  constructor(public readonly error: T) {
    super();
  }
}

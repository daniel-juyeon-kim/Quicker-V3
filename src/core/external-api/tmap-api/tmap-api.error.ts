import { ExternalApiError } from "../external-api.error";

export class TmapApiError<T> extends ExternalApiError {
  constructor(public readonly error: T) {
    super();
  }
}

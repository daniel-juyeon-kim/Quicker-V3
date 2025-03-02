import { ExternalApiException } from './external-api.exception';

export class TmapApiException extends ExternalApiException {
  constructor(public readonly error: unknown) {
    super();
  }
}

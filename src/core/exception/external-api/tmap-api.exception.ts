import { ExternalApiExceptionMessage } from '@src/core/constant/exception-message/external-api.enum';
import { ErrorResponseBody } from '@src/core/module';
import { ExternalApiException } from './external-api.exception';

export class TmapApiException extends ExternalApiException {
  constructor(
    error: ErrorResponseBody,
    target?: string,
    value?: string | number,
    cause: string = ExternalApiExceptionMessage.TmapApiException,
  ) {
    super(error, target, value, cause);
  }
}

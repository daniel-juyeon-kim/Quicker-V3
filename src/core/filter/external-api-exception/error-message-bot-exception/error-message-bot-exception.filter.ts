import { ArgumentsHost, Catch } from '@nestjs/common';
import {
  ErrorMessageBotException,
  ExternalApiException,
} from '@src/core/module';
import { AbstractExceptionFilter } from '../../abstract-exception.filter';

@Catch()
export class ErrorMessageBotExceptionFilter extends AbstractExceptionFilter<ExternalApiException> {
  catch(exception: ExternalApiException, host: ArgumentsHost) {
    if (exception instanceof ErrorMessageBotException) {
      this.logger.log(exception);
    }
  }
}

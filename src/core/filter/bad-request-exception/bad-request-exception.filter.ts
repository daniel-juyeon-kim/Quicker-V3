import {
  ArgumentsHost,
  BadRequestException,
  Catch,
  ExceptionFilter,
} from '@nestjs/common';
import { RequestDataValidationError } from '@src/core/pipe/request-data-validation/request-data-validation-error';
import { ValidationErrorElement } from '@src/core/pipe/request-data-validation/validation-error-element';
import { Response } from 'express';

@Catch(BadRequestException)
export class BadRequestExceptionFilter
  implements ExceptionFilter<BadRequestException>
{
  catch(exception: BadRequestException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const exceptionResponse: RequestDataValidationError =
      exception.getResponse() as RequestDataValidationError;

    const responseBody: ValidationErrorElement[] =
      exceptionResponse.createValidationErrorResponseBody();

    response.status(exception.getStatus()).json(responseBody);
  }
}

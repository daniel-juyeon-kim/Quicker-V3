import {
  BadRequestException,
  HttpStatus,
  Paramtype,
  ValidationError,
} from '@nestjs/common';
import { ErrorResponseBody } from '@src/core/response/error-response-body';
import { isUndefined } from '@src/core/util';
import { ValidationErrorDetail } from './validation-error-detail';

export class RequestDataValidationException extends BadRequestException {
  private readonly validationErrors: ValidationError[];
  private readonly paramType: Paramtype;
  private readonly code: HttpStatus = this.getStatus();
  public readonly message: string = HttpStatus[this.code];

  constructor({
    validationErrors,
    paramType,
  }: {
    validationErrors: ValidationError[];
    paramType: Paramtype;
  }) {
    super();
    this.validationErrors = validationErrors;
    this.paramType = paramType;
  }

  getResponse(): ErrorResponseBody<ValidationErrorDetail[]> {
    const errors: ValidationErrorDetail[] = [];

    this.flatMapValidationError(errors, this.validationErrors);

    return new ErrorResponseBody(this.code, this.message, errors);
  }

  private flatMapValidationError(
    list: ValidationErrorDetail[],
    errors: ValidationError[],
  ) {
    errors.forEach(({ property, value, constraints, children }) => {
      const message = this.findAllConstraintMessage(constraints);

      const error = new ValidationErrorDetail({
        property,
        value,
        message,
        paramType: this.paramType,
      });

      list.push(error);

      if (!this.isExistEmptyArray(children)) {
        this.flatMapValidationError(list, children);
      }
    });
  }

  private isExistEmptyArray(array?: ValidationError[]) {
    const isEmptyArray = Array.isArray(array) && array.length === 0;
    return isUndefined(array) || isEmptyArray;
  }

  private findAllConstraintMessage(constraints?: { [type: string]: string }) {
    if (isUndefined(constraints)) {
      return undefined;
    }
    return Object.values(constraints);
  }
}

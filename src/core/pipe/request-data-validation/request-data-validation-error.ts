import { Paramtype, ValidationError } from '@nestjs/common';
import { isUndefined } from '@src/core/util';
import { ValidationErrorElement } from './validation-error-element';

export class RequestDataValidationError {
  private readonly validationErrors: ValidationError[];
  private readonly paramType: Paramtype;

  constructor({
    validationErrors,
    paramType,
  }: {
    validationErrors: ValidationError[];
    paramType: Paramtype;
  }) {
    this.validationErrors = validationErrors;
    this.paramType = paramType;
  }

  createValidationErrorResponseBody(): ValidationErrorElement[] {
    const list: ValidationErrorElement[] = [];

    this.flatMapValidationError(list, this.validationErrors);

    return list;
  }

  private flatMapValidationError(
    list: ValidationErrorElement[],
    errors: ValidationError[],
  ) {
    errors.forEach(({ property, value, constraints, children }) => {
      // 응답의 요소, 유효성 검사 에러
      const error = this.createCustomValidationError({
        property,
        value,
        constraints,
      });

      list.push(error);

      if (!this.isExistEmptyArray(children)) {
        this.flatMapValidationError(list, children);
      }
    });
  }

  private createCustomValidationError({
    property,
    value,
    constraints,
  }: ValidationError): ValidationErrorElement {
    const message = this.findAllConstraintMessage(constraints);

    return new ValidationErrorElement({
      property,
      value,
      message,
      paramType: this.paramType,
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

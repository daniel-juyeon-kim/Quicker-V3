import { Paramtype } from '@nestjs/common';

export class ValidationErrorDetail {
  private readonly property: string;
  private readonly value?: any | undefined;
  private readonly message?: string[] | undefined;
  private readonly paramType: Paramtype;

  constructor({
    property,
    value,
    message,
    paramType,
  }: {
    property: string;
    value?: any | undefined;
    message?: string[] | undefined;
    paramType: Paramtype;
  }) {
    this.property = property;
    this.value = value;
    this.message = message;
    this.paramType = paramType;
  }
}

import { Paramtype } from '@nestjs/common';

export class ValidationErrorElement {
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
    value: any;
    message: string[];
    paramType: Paramtype;
  }) {
    this.property = property;
    this.value = value;
    this.message = message;
    this.paramType = paramType;
  }
}

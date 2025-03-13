import { isString } from 'class-validator';

export class ErrorDetail {
  private readonly value: string;

  constructor(value: unknown) {
    this.value = isString(value) ? value : JSON.stringify(value);
  }
}

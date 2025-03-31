import { ApiProperty } from '@nestjs/swagger';
import { isString } from 'class-validator';

export class ErrorDetail {
  @ApiProperty({ description: '문제가 발생하는 값' })
  private readonly value: string;

  constructor(value: unknown) {
    this.value = isString(value) ? value : JSON.stringify(value);
  }
}

import { Paramtype } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';

export class ValidationErrorDetail {
  @ApiProperty({ description: '유효성검사에 실패한 속성' })
  private readonly property: string;
  @ApiProperty({ description: '유효성검사에 실패한 값', required: false })
  private readonly value?: any | undefined;
  @ApiProperty({ description: '유효성검사 실패 메시지', required: false })
  private readonly message?: string[] | undefined;
  @ApiProperty({ description: '요청 파라미터(body, query ...)' })
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

import { HttpStatus } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';

export abstract class BaseResponseBody {
  @ApiProperty({ example: HttpStatus.OK, description: 'http 상태 코드' })
  readonly code: HttpStatus;
  @ApiProperty({ description: 'http 상태 메시지' })
  readonly message: string;

  constructor(code: HttpStatus, message: string) {
    this.code = code;
    this.message = message;
  }
}

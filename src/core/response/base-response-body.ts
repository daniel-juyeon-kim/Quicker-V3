import { HttpStatus } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';

export abstract class BaseResponseBody {
  @ApiProperty({ description: 'HTTP 상태 코드', example: HttpStatus.OK })
  readonly code: HttpStatus;
  @ApiProperty({ description: 'HTTP 상태 메시지' })
  readonly message: string;

  constructor(code: HttpStatus, message: string) {
    this.code = code;
    this.message = message;
  }
}

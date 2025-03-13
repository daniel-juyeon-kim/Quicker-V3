import { HttpStatus } from '@nestjs/common';
import { BaseResponseBody } from './base-response-body';

export class ResponseBody extends BaseResponseBody {
  constructor(
    code: HttpStatus,
    message: string,
    readonly data?: any,
  ) {
    super(code, message);
  }
}

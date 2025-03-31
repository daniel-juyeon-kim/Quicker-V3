import { HttpStatus } from '@nestjs/common';
import { BaseResponseBody } from './base-response-body';

export class ResponseBody extends BaseResponseBody {
  readonly data?: any;

  constructor(code: HttpStatus, message: string, data?: any) {
    super(code, message);
    this.data = data;
  }
}

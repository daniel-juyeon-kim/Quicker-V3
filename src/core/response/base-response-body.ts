import { HttpStatus } from '@nestjs/common';

export abstract class BaseResponseBody {
  constructor(
    readonly code: HttpStatus,
    readonly message: string,
  ) {}
}

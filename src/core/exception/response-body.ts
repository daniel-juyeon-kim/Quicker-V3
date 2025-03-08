import { HttpStatus } from '@nestjs/common';
import { Expose } from 'class-transformer';

export class ResponseBody {
  @Expose()
  readonly statusCode: HttpStatus;
  @Expose()
  readonly message: string;
  @Expose()
  readonly value?: string | number | Record<string, any> | Date;
}

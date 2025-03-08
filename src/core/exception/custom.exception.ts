import { HttpException, HttpStatus } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { DebugResponseBody } from './debug-response-body';
import { ResponseBody } from './response-body';

export abstract class CustomException extends HttpException {
  constructor(
    readonly value: string | number | Record<string, any> | Date,
    readonly message: string,
    readonly statusCode: HttpStatus,
  ) {
    super(message, statusCode);
  }

  getResponse(): ResponseBody {
    return plainToInstance(ResponseBody, this, {
      excludeExtraneousValues: true,
      exposeUnsetFields: false,
    });
  }

  createDebugResponseBody(): DebugResponseBody {
    return plainToInstance(DebugResponseBody, this, {
      excludeExtraneousValues: true,
      exposeUnsetFields: false,
    });
  }
}

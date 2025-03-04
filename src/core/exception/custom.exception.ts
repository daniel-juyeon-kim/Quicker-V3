import { plainToInstance } from 'class-transformer';
import { DebugResponseBody } from './debug-response-body';
import { ResponseBody } from './response-body';

export abstract class CustomException extends Error {
  public abstract readonly target?: string;
  public abstract readonly value?: string | number;
  public abstract readonly cause: string;

  createResponseBody(): ResponseBody {
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

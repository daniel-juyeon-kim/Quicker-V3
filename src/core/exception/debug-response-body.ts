import { Expose } from 'class-transformer';
import { ResponseBody } from './response-body';

export class DebugResponseBody extends ResponseBody {
  @Expose()
  public readonly error?: Error;
}

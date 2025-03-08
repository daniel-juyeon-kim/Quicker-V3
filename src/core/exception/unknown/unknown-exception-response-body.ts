import { Exclude } from 'class-transformer';
import { ResponseBody } from '../response-body';

export class UnknownExceptionResponseBody extends ResponseBody {
  @Exclude()
  readonly value?: string | number | Record<string, any> | Date;
}

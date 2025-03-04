import { Expose } from 'class-transformer';

export class ResponseBody {
  @Expose()
  public readonly target?: string;
  @Expose()
  public readonly value?: string | number;
  @Expose()
  public readonly cause: string;
}

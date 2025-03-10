import {
  CallHandler,
  ExecutionContext,
  HttpStatus,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { ResponseBody } from '@src/core/response';
import { map, Observable } from 'rxjs';

@Injectable()
export class ResponseFormatInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((data: any) => {
        const res = context.switchToHttp().getResponse();
        const code = res.statusCode;

        return new ResponseBody(code, HttpStatus[code], data);
      }),
    );
  }
}

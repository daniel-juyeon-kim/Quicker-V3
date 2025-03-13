import { CallHandler, ExecutionContext } from '@nestjs/common';
import { ResponseBody } from '@src/core/response';
import { of } from 'rxjs';
import { ResponseFormatInterceptor } from './response-format.interceptor';

describe('ResponseFormatInterceptor', () => {
  let interceptor: ResponseFormatInterceptor;
  let context: ExecutionContext;
  let next: CallHandler;

  beforeEach(() => {
    interceptor = new ResponseFormatInterceptor();
    context = {
      switchToHttp: jest.fn().mockReturnValue({
        getResponse: jest.fn().mockReturnValue({
          statusCode: 200,
        }),
      }),
    } as unknown as ExecutionContext;
    next = {
      handle: jest.fn().mockReturnValue(of({ data: 'test' })),
    };
  });

  describe('intercept', () => {
    it('응답 형식을 올바르게 변환해야 한다', () => {
      interceptor.intercept(context, next).subscribe((result) => {
        expect(result).toEqual(new ResponseBody(200, 'OK', { data: 'test' }));
      });
    });

    it('상태 코드가 올바르게 설정되어야 한다', () => {
      context.switchToHttp().getResponse = jest.fn().mockReturnValue({
        statusCode: 404,
      });

      interceptor.intercept(context, next).subscribe((result) => {
        expect(result).toEqual(
          new ResponseBody(404, 'NOT_FOUND', { data: 'test' }),
        );
      });
    });
  });
});

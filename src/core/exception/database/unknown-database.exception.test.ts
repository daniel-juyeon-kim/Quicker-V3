import { plainToInstance } from 'class-transformer';
import { DebugResponseBody } from '../debug-response-body';
import { ResponseBody } from '../response-body';
import { DuplicatedDataException } from './duplicated-data.exception';
import { UnknownDataBaseException } from './unknown-database.exception';

describe('UnknownDataBaseException', () => {
  const error = new Error('Test error');
  const target = 'TestTarget';
  const value = 'TestValue';
  const cause = 'Custom cause message';

  const exception = new UnknownDataBaseException(error, target, value, cause);

  describe('createResponseBody', () => {
    it('에러 객체가 포함되지 않음', () => {
      expect(exception.createResponseBody()).toEqual(
        plainToInstance(ResponseBody, {
          target,
          value,
          cause,
        }),
      );
    });
  });

  describe('createDebugResponseBody', () => {
    it('에러 객체를 포함해야함', () => {
      expect(exception.createDebugResponseBody()).toEqual(
        plainToInstance(DebugResponseBody, {
          cause,
          error,
          target,
          value,
        }),
      );
    });

    it('커스텀 에러 객체를 포함해야함', () => {
      const error = new DuplicatedDataException();
      const target = 'TestTarget';
      const value = 'TestValue';
      const cause = 'Custom cause message';

      const exception = new UnknownDataBaseException(
        error,
        target,
        value,
        cause,
      );

      expect(exception.createDebugResponseBody()).toEqual(
        plainToInstance(DebugResponseBody, {
          cause,
          error,
          target,
          value,
        }),
      );
    });
  });
});

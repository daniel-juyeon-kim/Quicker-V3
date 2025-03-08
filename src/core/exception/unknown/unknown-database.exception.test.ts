import { instanceToPlain } from 'class-transformer';
import { UnknownDataBaseException } from './unknown-database.exception';

describe('UnknownDataBaseException', () => {
  const error = new Error('Test error');
  const message = '에러메시지';

  const exception = new UnknownDataBaseException(error, message);

  describe('getResponse', () => {
    it('value 속성에 값을 넣어도 getResponse에서는 제외됨', () => {
      const responseBody = instanceToPlain(exception.getResponse());

      expect(responseBody).toEqual({
        message: message,
        statusCode: 500,
      });
    });
  });
});

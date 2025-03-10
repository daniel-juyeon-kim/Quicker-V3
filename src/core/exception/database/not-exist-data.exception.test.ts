import { HttpStatus } from '@nestjs/common';
import { DataBaseExceptionMessage } from '@src/core/constant/exception-message/database.enum';
import { NotExistDataException } from './not-exist-data.exception';

describe('NotExistDataException', () => {
  describe('getResponse', () => {
    it('CustomException.getResponse가 사용됨', () => {
      const value = 'testValue';
      const exception = new NotExistDataException(value);

      expect(exception.getResponse()).toEqual({
        code: HttpStatus.NOT_FOUND,
        message: DataBaseExceptionMessage.NotExistDataException,
        error: {
          value,
        },
      });
    });
  });
});

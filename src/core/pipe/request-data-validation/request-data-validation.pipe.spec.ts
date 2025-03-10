import {
  ArgumentMetadata,
  BadRequestException,
  HttpStatus,
} from '@nestjs/common';
import { Type } from 'class-transformer';
import { IsDate, IsString } from 'class-validator';
import { RequestDataValidationException } from '../../exception/request-data-validation-exception/request-data-validation-exception';
import { RequestDataValidationPipe } from './request-data-validation.pipe';

class TestDto {
  @IsString()
  @Type(() => String)
  test: string;
  @IsDate()
  @Type(() => Date)
  date: Date;
}

describe('RequestDataValidationPipe', () => {
  let pipe: RequestDataValidationPipe;

  beforeEach(() => {
    pipe = new RequestDataValidationPipe();
  });

  describe('transform', () => {
    it('통과: 메타타입이 없으면 값을 그대로 반환한다', async () => {
      const value = { test: 'test' };
      const metadata: ArgumentMetadata = { type: 'body', metatype: undefined };

      await expect(pipe.transform(value, metadata)).resolves.toEqual(value);
    });

    it('통과: 메타타입이 유효성 검사를 필요로 하지 않으면 값을 반환한다', async () => {
      const value = { test: 'test' };
      const metadata: ArgumentMetadata = {
        type: 'body',
        metatype: String,
      };

      await expect(pipe.transform(value, metadata)).resolves.toEqual(value);
    });

    it('통과: 유효성 검사와 변환을 하고 반환한다.', async () => {
      const currentDate = new Date();
      const value = { test: 'test', date: currentDate.toISOString() };
      const metadata: ArgumentMetadata = {
        type: 'body',
        metatype: TestDto,
      };

      await expect(pipe.transform(value, metadata)).resolves.toEqual({
        test: 'test',
        date: currentDate,
      });
    });

    it('실패: 유효성 검사에 실패하면 BadRequestException를 던짐', async () => {
      const value = { test: 'test', date: 'invalid-date' };
      const metadata: ArgumentMetadata = {
        type: 'body',
        metatype: TestDto,
      };

      const expectResponse = {
        code: HttpStatus.BAD_REQUEST,
        message: HttpStatus[HttpStatus.BAD_REQUEST],
        error: [
          {
            paramType: 'body',
            property: 'date',
            value: null,
            message: ['date must be a Date instance'],
          },
        ],
      };

      try {
        await pipe.transform(value, metadata);
      } catch (e) {
        const error = e as RequestDataValidationException;

        expect(error)
          .toBeInstanceOf(BadRequestException)
          .toBeInstanceOf(RequestDataValidationException);

        const response = JSON.parse(JSON.stringify(error.getResponse()));

        expect(response).toMatchObject(expectResponse);
      }
    });
  });
});

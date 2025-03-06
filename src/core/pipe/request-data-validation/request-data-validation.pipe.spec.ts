import { ArgumentMetadata, BadRequestException } from '@nestjs/common';
import { Type } from 'class-transformer';
import { IsDate, IsString } from 'class-validator';
import { RequestDataValidationError } from './request-data-validation-error';
import { RequestDataValidationPipe } from './request-data-validation.pipe';
import { ValidationErrorElement } from './validation-error-element';

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

      const expectResponse = [
        new ValidationErrorElement({
          property: 'date',
          value: new Date(NaN),
          message: ['date must be a Date instance'],
          paramType: 'body',
        }),
      ];

      try {
        await pipe.transform(value, metadata);
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException);
        expect(error.getResponse()).toBeInstanceOf(RequestDataValidationError);

        const requestDataValidationError =
          error.getResponse() as RequestDataValidationError;

        expect(
          JSON.stringify(
            requestDataValidationError.createValidationErrorResponseBody(),
          ),
        ).toEqual(JSON.stringify(expectResponse));
      }
    });
  });
});

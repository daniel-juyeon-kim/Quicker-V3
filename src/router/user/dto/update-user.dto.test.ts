import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { UpdateUserDto } from './update-user.dto';

describe('UpdateUserDto', () => {
  const getValidationErrors = async (dto: object) => {
    const instance = plainToInstance(UpdateUserDto, dto);
    return validate(instance);
  };

  describe('통과하는 테스트', () => {
    test('유효한 형식', async () => {
      const dto = {
        imageId: '001',
      };

      const errors = await getValidationErrors(dto);

      expect(errors.length).toBe(0);
    });
  });

  describe('실패하는 테스트', () => {
    test('imageId가 문자열 타입 숫자가 아님', async () => {
      const dto = {
        imageId: 'lsiafenl',
      };

      const errors = await getValidationErrors(dto);

      expect(errors.length).toEqual(1);
      expect(errors.map((e) => e.property)).toEqual(['imageId']);
    });

    test('imageId가 number타입', async () => {
      const dto = {
        imageId: 999, // 잘못된 타입 (number)
      };

      const errors = await getValidationErrors(dto);

      expect(errors.length).toEqual(1);
      expect(errors.map((e) => e.property)).toEqual(['imageId']);
    });

    test('필드 누락', async () => {
      const dto = {};

      const errors = await getValidationErrors(dto);

      expect(errors.length).toEqual(1);
      expect(errors.map((e) => e.property)).toEqual(['imageId']);
    });
  });
});

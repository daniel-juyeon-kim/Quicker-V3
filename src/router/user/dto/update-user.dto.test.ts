import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { UpdateUserDto } from './update-user.dto';

describe('UpdateUserDto Validation', () => {
  const getValidationErrors = async (dto: object) => {
    const instance = plainToInstance(UpdateUserDto, dto);
    return validate(instance);
  };

  describe('통과하는 테스트', () => {
    test('유효한 형식', async () => {
      const dto = {
        walletAddress: '0xA1b2C3d4E5F67890abcdef1234567890ABCDEF12',
        imageId: '001',
      };

      const errors = await getValidationErrors(dto);

      expect(errors.length).toBe(0);
    });
  });

  describe('실패하는 테스트', () => {
    test('walletAddress가 number타입', async () => {
      const dto = {
        walletAddress: 123456, // 잘못된 타입 (number)
        imageId: '001',
      };

      const errors = await getValidationErrors(dto);

      expect(errors.length).toEqual(1);
      expect(errors.map((e) => e.property)).toEqual(['walletAddress']);
    });

    test('imageId가 number타입', async () => {
      const dto = {
        walletAddress: '0xA1b2C3d4E5F67890abcdef1234567890ABCDEF12',
        imageId: 999, // 잘못된 타입 (number)
      };

      const errors = await getValidationErrors(dto);

      expect(errors.length).toEqual(1);
      expect(errors.map((e) => e.property)).toEqual(['imageId']);
    });

    test('모든 필드가 누락', async () => {
      const dto = {};

      const errors = await getValidationErrors(dto);

      expect(errors.length).toEqual(2);
      expect(errors.map((e) => e.property)).toEqual([
        'walletAddress',
        'imageId',
      ]);
    });
  });
});

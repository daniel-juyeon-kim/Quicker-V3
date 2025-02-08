import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CreateUserDto } from './create-user.dto';

describe('CreateUserDto', () => {
  describe('통과하는 테스트', () => {
    test('모든 필드가 통과함', async () => {
      const dto = plainToInstance(CreateUserDto, {
        walletAddress: '0xA1b2C3d4E5F67890abcdef1234567890ABCDEF12',
        name: 'John Doe',
        email: 'john@example.com',
        contact: '010-1234-7890',
        birthDate: '2000-01-01T00:00:00.000Z', // 문자열이지만 @Type(() => Date)로 변환됨
      });
      const result = [];

      await expect(validate(dto)).resolves.toEqual(result);
    });
  });

  describe('실패하는 테스트', () => {
    test('모든 필드 누락', async () => {
      const dto = plainToInstance(CreateUserDto, {});
      const result = [
        {
          children: [],
          constraints: {
            isEthereumAddress: 'walletAddress must be an Ethereum address',
          },
          property: 'walletAddress',
          target: {},
          value: undefined,
        },
        {
          children: [],
          constraints: { isString: 'name must be a string' },
          property: 'name',
          target: {},
          value: undefined,
        },
        {
          children: [],
          constraints: { isEmail: 'email must be an email' },
          property: 'email',
          target: {},
          value: undefined,
        },
        {
          children: [],
          constraints: {
            isPhoneNumber: 'contact must be a valid phone number',
          },
          property: 'contact',
          target: {},
          value: undefined,
        },
        {
          children: [],
          constraints: { isDate: 'birthDate must be a Date instance' },
          property: 'birthDate',
          target: {},
          value: undefined,
        },
      ];

      const errors = await validate(dto);

      expect(errors).toEqual(result);
    });

    test('잘못된 데이터 타입', async () => {
      const dto = plainToInstance(CreateUserDto, {
        walletAddress: 12345, // 잘못된 타입 (string이 아님)
        name: true, // 잘못된 타입
        email: 'invalid-email', // 유효하지 않은 이메일
        contact: {}, // 잘못된 타입
        birthDate: 'invalid-date', // 변환 불가능한 날짜 문자열
      });

      const errors = await validate(dto);

      expect(errors.length).toEqual(5);
      expect(errors.map((e) => e.property)).toEqual([
        'walletAddress',
        'name',
        'email',
        'contact',
        'birthDate',
      ]);
    });
  });
});

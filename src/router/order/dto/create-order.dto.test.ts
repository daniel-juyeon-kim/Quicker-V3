import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { describe } from 'node:test';
import { CreateOrderDto } from './create-order.dto';

describe('CreateOrderDto', () => {
  const validData = {
    walletAddress: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
    detail: 'Test order',
    transportation: {
      bicycle: true,
      bike: false,
      car: true,
    },
    product: {
      width: 10,
      length: 20,
      height: 30,
      weight: 5,
    },
    destination: { x: 1, y: 2 },
    departure: { x: 3, y: 4 },
    sender: { name: 'Alice', phone: '010-1234-5678' },
    receiver: { name: 'Bob', phone: '010-9876-5432' },
  } as const;

  describe('통과하는 테스트', () => {
    test('유효한 DTO는 검증을 통과해야 한다', async () => {
      const dto = plainToInstance(CreateOrderDto, validData);

      const errors = await validate(dto);

      expect(errors).toEqual([]);

      // transportationDto로 변환
      expect(dto.transportation.bicycle).toEqual(1);
      expect(dto.transportation.bike).toBeUndefined();
      expect(dto.transportation.car).toEqual(1);
    });
  });

  describe('실패하는 테스트', () => {
    test('지갑 주소가 올바르지 않으면 검증에 실패해야 한다', async () => {
      const dto = plainToInstance(CreateOrderDto, {
        ...validData,
        walletAddress: 'invalid_address',
      });

      const errors = await validate(dto);

      expect(errors.length).toEqual(1);
      expect(errors[0].property).toEqual('walletAddress');
    });

    test('상품 정보가 없으면 검증에 실패해야 한다', async () => {
      const data = {
        ...validData,
        product: {},
      };

      const dto = plainToInstance(CreateOrderDto, data);

      const errors = await validate(dto);

      expect(errors.length).toEqual(1);
      expect(errors[0].property).toEqual('product');
    });
  });

  test('transportation은 최소 하나의 속성을 가지고 있어야 함', async () => {
    const dto = plainToInstance(CreateOrderDto, {
      ...validData,
      transportation: {},
    });

    const errors = [
      {
        children: [],
        constraints: {
          isNotEmptyObject: 'transportation must be a non-empty object',
        },
        property: 'transportation',
        target: dto,
        value: {},
      },
    ];

    await expect(validate(dto)).resolves.toEqual(errors);
  });
});

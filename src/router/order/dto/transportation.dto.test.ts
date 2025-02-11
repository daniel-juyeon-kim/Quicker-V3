import { validate } from 'class-validator';
import { TransportationDto } from './create-order.dto';

describe('transportation 테스트', () => {
  describe('parsePartialTransportationEntity 테스트', () => {
    test('통과하는 테스트', () => {
      const data = { bike: true };

      const dto = TransportationDto.parsePartialTransportationEntity(data);

      expect(dto).toEqual({ bike: 1 });
    });
  });

  describe('검증 테스트', () => {
    test('실패하는 테스트', async () => {
      const dto = new TransportationDto();

      dto.bicycle = 1;
      dto.bike = 2;

      const errors = await validate(dto);

      expect(errors).toEqual([
        {
          children: [],
          constraints: { isNumberOne: 'bike속성에 2는 제약조건에 충돌합니다.' },
          property: 'bike',
          target: { bicycle: 1, bike: 2 },
          value: 2,
        },
      ]);
    });
  });
});

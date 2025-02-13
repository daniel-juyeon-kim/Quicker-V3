import { validate } from 'class-validator';
import { TransportationDto } from './create-orders.dto';

describe('transportationDto', () => {
  describe('parsePartialTransportationEntity', () => {
    test('통과하는 테스트', () => {
      const data = { bike: true };

      const dto = TransportationDto.parsePartialTransportationEntity(data);

      expect(dto).toEqual({ bike: 1 });
    });
  });

  test('실패하는 테스트, 속성값은 0 또는 1만 가능함', async () => {
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

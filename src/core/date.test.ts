import {
  createFirstDateOfCurrentMonth,
  createLastMonth,
  createLastMonthRange,
} from './date';

describe('createLastMonthRange()', () => {
  describe('통과하는 테스트', () => {
    test('생성된 날자가 올해인 테스트', () => {
      // 2024. 05. 01 0시 0분 0초
      const date = new Date(2024, 4, 1);

      // 2024. 04. 01 0시 0분 0초
      const start = new Date(2024, 3, 1);

      // 2024. 04. 30 23시 59분 59초 999
      const end = new Date(2024, 4, 0, 23, 59, 59, 999);

      expect(createLastMonthRange(date)).toEqual({ start, end });
    });

    test('생성된 날자가 작년인 테스트', () => {
      // 2024. 01. 01 0시 0분 0초
      const date = new Date(2024, 0, 1);

      // 2023. 12. 01 0시 0분 0초
      const start = new Date(2023, 11, 1);

      // 2024. 12. 31 23시 59분 59초 999
      const end = new Date(2024, 0, 0, 23, 59, 59, 999);

      // 작년 12월 올해 1월
      expect(createLastMonthRange(date)).toEqual({ start, end });
    });
  });
});

describe('createLastMonth()', () => {
  describe('통과하는 테스트', () => {
    test('생성된 날자가 올해인 테스트', () => {
      const date = new Date(1999, 1, 1);
      const expectDate = new Date(1999, 0);

      expect(createLastMonth(date)).toEqual(expectDate);
    });

    test('생성된 날자가 작년인 테스트', () => {
      const date = new Date(1999, 0, 1);
      const expectDate = new Date(1998, 11);

      expect(createLastMonth(date)).toEqual(expectDate);
    });
  });
});

describe('createFirstDateOfCurrentMonth()', () => {
  describe('통과하는 테스트', () => {
    test('현재 날자가 말일인 경우', () => {
      const now = new Date(2024, 11, 29);
      const result = createFirstDateOfCurrentMonth(now);

      expect(result).toEqual(new Date(2024, 11, 1));
      expect(result).not.toEqual(new Date(2024, 12, 1));
    });

    test('현재 날자가 1일인 경우', () => {
      const now = new Date(2024, 11, 1);
      const result = createFirstDateOfCurrentMonth(now);

      expect(result).toEqual(new Date(2024, 11, 1));
    });
  });
});

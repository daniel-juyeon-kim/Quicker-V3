import { findDistanceKey } from './distance';

describe('findDistanceKey 테스트', () => {
  test('통과하는 테스트', () => {
    const testCases = [
      { value: 4, result: '5KM' },
      { value: 5, result: '5KM' },
      { value: 9, result: '10KM' },
      { value: 10, result: '10KM' },
      { value: 14, result: '15KM' },
      { value: 15, result: '15KM' },
      { value: 19, result: '20KM' },
      { value: 20, result: '20KM' },
      { value: 24, result: '25KM' },
      { value: 25, result: '25KM' },
      { value: 29, result: '30KM' },
      { value: 30, result: '30KM' },
      { value: 39, result: '40KM' },
      { value: 40, result: '40KM' },
      { value: 49, result: '50KM' },
      { value: 50, result: '50KM' },
      { value: 59, result: '60KM' },
      { value: 60, result: '60KM' },
      { value: 61, result: '60+KM' },
    ];

    testCases.forEach(({ value, result }) =>
      expect(findDistanceKey(value)).toBe(result),
    );
  });

  test('예외 던짐', () => {
    const testCases = [
      { value: NaN, errorMessage: 'NaN는 유효한 정수가 아닙니다.' },
      { value: Infinity, errorMessage: 'Infinity는 유효한 정수가 아닙니다.' },
      { value: -Infinity, errorMessage: '-Infinity는 유효한 정수가 아닙니다.' },
    ];

    testCases.forEach(({ value, errorMessage }) => {
      expect(() => findDistanceKey(value)).toThrow(errorMessage);
    });
  });
});

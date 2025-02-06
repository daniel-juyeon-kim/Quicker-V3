import { parseNumericStringToNumberList } from './parser';

describe('객체의 속성중 null이 있는지 확인하는 테스트', () => {
  test('성공', () => {
    const testCases = ['1', '1,2', '1,2,3,4'];
    const expectResults = [[1], [1, 2], [1, 2, 3, 4]];

    testCases.forEach((testCase, index) => {
      const result = parseNumericStringToNumberList(testCase);

      expect(result).toStrictEqual(expectResults[index]);
    });
  });

  test('실패하는 테스트', () => {
    const testCases = ['Infinity', '2,i'];
    const expectErrorMessage = [
      'Infinity는 유효한 정수가 아닙니다.',
      'i는 유효한 정수가 아닙니다.',
    ];

    testCases.forEach((testCase, index) => {
      expect(() => parseNumericStringToNumberList(testCase)).toThrow(
        expectErrorMessage[index],
      );
    });
  });
});

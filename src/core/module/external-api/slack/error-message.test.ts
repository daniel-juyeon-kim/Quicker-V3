import { ErrorMessage } from '../..';

describe('ErrorMessage 테스트', () => {
  describe('parseToStringForSlack 테스트', () => {
    test('통과하는 테스트', () => {
      const error = {
        name: '테스트용 에러 메시지 ',
        message: '에러 메시지',
        stack: '스텍트레이스',
      };
      const occurDate = new Date(1995, 11, 17, 3, 24, 0);
      const errorMessage = new ErrorMessage({
        exception: error,
        date: occurDate,
      });

      const expectMessage = `*에러 발생 [ ${occurDate.toLocaleString('ko-KR')} ]* \n\n${JSON.stringify(error)}`;

      expect(errorMessage.parseToStringForSlack()).toBe(expectMessage);
    });
  });
});

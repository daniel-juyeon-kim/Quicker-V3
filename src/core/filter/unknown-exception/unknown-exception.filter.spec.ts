import { TestBed } from '@automock/jest';
import {
  ArgumentsHost,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { CoreToken } from '@src/core/constant';
import {
  ErrorMessage,
  ErrorMessageBot,
  UnknownDataBaseException,
} from '@src/core/module';
import { NotExistDataException } from '@src/database';
import { mock } from 'jest-mock-extended';
import { UnknownExceptionFilter } from './unknown-exception.filter';

const date = new Date(2000, 1, 1);
jest.useFakeTimers({ now: date });

describe('UnknownExceptionFilter', () => {
  let filter: UnknownExceptionFilter;
  let messageBot: jest.Mocked<ErrorMessageBot>;
  let logger: jest.Mocked<Logger>;

  const mockHost = mock<ArgumentsHost>();

  beforeEach(() => {
    const { unit, unitRef } = TestBed.create(UnknownExceptionFilter).compile();

    filter = unit;
    messageBot = unitRef.get(CoreToken.ERROR_MESSAGE_BOT);
    logger = unitRef.get(Logger);
  });

  describe('catch', () => {
    test('슬랙 메시지와 로깅이 동작후 response 500', async () => {
      const exception = new UnknownDataBaseException('Unknown DB exception');

      await expect(filter.catch(exception, mockHost)).rejects.toEqual(
        new InternalServerErrorException(),
      );

      expect(messageBot.sendMessage).toHaveBeenCalledWith(
        new ErrorMessage({ exception, date }),
      );
      expect(logger.log).toHaveBeenCalledWith(exception);
    });

    test('슬랙 메시지 발송 실패시 파일로 로깅처리', async () => {
      const exception = new UnknownDataBaseException(
        '슬랙 메시지 오류를 발생시키이 위한 임시 에러',
      );
      const slackError = new Error('슬랙 메시지 전송 에러');
      messageBot.sendMessage.mockRejectedValue(slackError);

      await expect(filter.catch(exception, mockHost)).rejects.toEqual(
        new InternalServerErrorException(),
      );

      expect(logger.log)
        .toHaveBeenCalledWith(exception)
        .toHaveBeenCalledWith(slackError);
    });

    test('해당 필터의 담당이 아닌 에러 처리', async () => {
      const exception = new NotExistDataException('데이터베이스 계층 에러');

      await expect(filter.catch(exception, mockHost)).resolves.toEqual(
        undefined,
      );

      expect(messageBot.sendMessage).not.toHaveBeenCalled();
      expect(logger.log).not.toHaveBeenCalled();
    });
  });
});

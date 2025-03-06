import { ArgumentsHost, HttpStatus, LoggerService } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { CoreToken, LoggerToken } from '@src/core/constant';
import { CustomException } from '@src/core/exception/custom.exception';
import { ErrorMessageBot } from '@src/core/module';
import { Response } from 'express';
import { mock, mockDeep, mockReset } from 'jest-mock-extended';
import { GlobalExceptionFilter } from './global-exception.filter';

describe('GlobalExceptionFilter', () => {
  let filter: GlobalExceptionFilter;
  const mockHost = mock<ArgumentsHost>();
  const mockResponse = mockDeep<Response>();

  const errorMessageBot = mock<ErrorMessageBot>();
  const mockLogger = mock<LoggerService>();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GlobalExceptionFilter,
        {
          provide: CoreToken.ERROR_MESSAGE_BOT,
          useValue: errorMessageBot,
        },
        {
          provide: LoggerToken.GLOBAL_EXCEPTION_LOGGER,
          useValue: mockLogger,
        },
      ],
    }).compile();

    filter = module.get(GlobalExceptionFilter);

    mockReset(mockHost);
    mockReset(mockResponse);
    mockReset(errorMessageBot);
    mockReset(mockLogger);

    mockHost.switchToHttp.mockReturnValue({
      getResponse: () => mockResponse,
    } as any);

    mockResponse.status.mockReturnThis();
    mockResponse.json.mockReturnThis();
  });

  describe('catch', () => {
    test('공통 예외 필터 테스트', async () => {
      class ExampleException extends CustomException {
        public target?: string;
        public value?: string | number;
        public cause: string;
      }

      const exception = new ExampleException();

      await filter.catch(exception, mockHost);

      expect(mockResponse.status).toHaveBeenCalledWith(
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
      expect(mockResponse.json).toHaveBeenCalled();
    });
  });
});

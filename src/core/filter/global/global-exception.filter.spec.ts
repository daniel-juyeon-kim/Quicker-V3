import {
  ArgumentsHost,
  HttpException,
  HttpStatus,
  LoggerService,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { Test, TestingModule } from '@nestjs/testing';
import { CoreToken, LoggerToken } from '@src/core/constant';
import { ErrorMessageBot } from '@src/core/module';
import { Response } from 'express';
import { mock, mockReset } from 'jest-mock-extended';
import { GlobalExceptionFilter } from './global-exception.filter';

describe('GlobalExceptionFilter', () => {
  let filter: GlobalExceptionFilter;

  const mockHost = mock<ArgumentsHost>();
  const mockResponse = mock<Response>();
  const mockHttpAdapterHost = mock<HttpAdapterHost>();
  const mockHttpAdapterReply = jest.fn();

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
        {
          provide: HttpAdapterHost,
          useValue: mockHttpAdapterHost,
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

    mockHttpAdapterHost.httpAdapter.isHeadersSent = () => false;
    mockHttpAdapterHost.httpAdapter.reply = mockHttpAdapterReply;
  });

  describe('catch', () => {
    test('전역 예외 필터 테스트, HttpException를 상속한 예외를 잡으면 BaseExceptionFilter에서 처리된다.', async () => {
      class ExampleException extends HttpException {}

      const response = '응답 본문';
      const statusCode = HttpStatus.INTERNAL_SERVER_ERROR;

      const exception = new ExampleException(response, statusCode);

      await filter.catch(exception, mockHost);

      expect(mockResponse.status).toHaveBeenCalledTimes(0);
      expect(mockResponse.json).toHaveBeenCalledTimes(0);

      // BaseExceptionFilter에서 처리
      expect(mockHttpAdapterReply).toHaveBeenCalledWith(
        undefined,
        { message: '응답 본문', statusCode: 500 },
        500,
      );
    });
  });
});

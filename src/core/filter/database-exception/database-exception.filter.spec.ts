import { ArgumentsHost, HttpStatus, LoggerService } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { CoreToken, LoggerToken } from '@src/core/constant';
import { DataBaseExceptionMessage } from '@src/core/constant/exception-message/database.enum';
import {
  BusinessRuleConflictDataException,
  DuplicatedDataException,
  NotExistDataException,
} from '@src/core/exception';
import { UnknownDataBaseException } from '@src/core/exception/database/unknown-database.exception';
import { ErrorMessageBot } from '@src/core/module';
import { Response } from 'express';
import { mock, mockDeep, mockReset } from 'jest-mock-extended';
import { DatabaseExceptionHttpStatusMap } from './database-exception-http-status-map';
import { DatabaseExceptionFilter } from './database-exception.filter';

describe('DatabaseExceptionFilter', () => {
  let filter: DatabaseExceptionFilter;
  const mockHost = mockDeep<ArgumentsHost>();
  const mockResponse = mockDeep<Response>();

  const logger = mock<LoggerService>();
  const errorMessageBot = mock<ErrorMessageBot>();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DatabaseExceptionFilter,
        DatabaseExceptionHttpStatusMap,
        {
          provide: LoggerToken.UNKNOWN_DATABASE_EXCEPTION_LOGGER,
          useValue: logger,
        },
        {
          provide: CoreToken.ERROR_MESSAGE_BOT,
          useValue: errorMessageBot,
        },
      ],
    }).compile();

    filter = module.get<DatabaseExceptionFilter>(DatabaseExceptionFilter);

    mockReset(mockHost);
    mockReset(mockResponse);

    mockHost.switchToHttp.mockReturnValue({
      getResponse: () => mockResponse,
    } as any);

    mockResponse.status.mockReturnThis();
    mockResponse.json.mockReturnThis();
  });

  describe('catch', () => {
    test('DuplicatedDataException 처리', async () => {
      const exception = new DuplicatedDataException();

      await filter.catch(exception, mockHost);

      const response = mockHost.switchToHttp().getResponse<Response>();

      expect(response.status).toHaveBeenCalledWith(HttpStatus.CONFLICT);
      expect(response.json).toHaveBeenCalledWith({
        cause: DataBaseExceptionMessage.DuplicatedDataException,
      });
    });

    test('NotExistDataException 처리', async () => {
      const exception = new NotExistDataException();

      await filter.catch(exception, mockHost);

      const response = mockHost.switchToHttp().getResponse<Response>();

      expect(response.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
      expect(response.json).toHaveBeenCalledWith({
        cause: DataBaseExceptionMessage.NotExistDataException,
      });
    });

    test('BusinessRuleConflictDataException 처리', async () => {
      const exception = new BusinessRuleConflictDataException();

      await filter.catch(exception, mockHost);

      const response = mockHost.switchToHttp().getResponse<Response>();

      expect(response.status).toHaveBeenCalledWith(
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
      expect(response.json).toHaveBeenCalledWith({
        cause: DataBaseExceptionMessage.BusinessRuleConflictDataException,
      });
    });

    test('UnknownDataBaseException 처리', async () => {
      const exception = new UnknownDataBaseException(new Error());

      await filter.catch(exception, mockHost);

      const response = mockHost.switchToHttp().getResponse<Response>();

      expect(response.status).toHaveBeenCalledWith(
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
      expect(response.json).toHaveBeenCalledWith({
        cause: DataBaseExceptionMessage.UnknownDataBaseException,
      });

      expect(logger.log).toHaveBeenCalledWith(exception);
      expect(errorMessageBot.sendMessage).toHaveBeenCalledTimes(1);
    });
  });
});

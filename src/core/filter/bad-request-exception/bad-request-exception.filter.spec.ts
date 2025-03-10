import { ArgumentsHost, HttpStatus } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { RequestDataValidationException } from '@src/core/exception/request-data-validation-exception/request-data-validation-exception';
import { Response } from 'express';
import { mock, mockReset } from 'jest-mock-extended';
import { BadRequestExceptionFilter } from './bad-request-exception.filter';

describe('BadRequestExceptionFilter', () => {
  let filter: BadRequestExceptionFilter;

  const mockHost = mock<ArgumentsHost>();
  const mockResponse = mock<Response>();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BadRequestExceptionFilter],
    }).compile();

    filter = module.get<BadRequestExceptionFilter>(BadRequestExceptionFilter);

    mockReset(mockHost);
    mockReset(mockResponse);

    mockHost.switchToHttp.mockReturnValue({
      getResponse: () => mockResponse,
    } as any);

    mockResponse.status.mockReturnThis();
    mockResponse.json.mockReturnThis();
  });

  it('BadRequestException을 처리하고 유효성 검사 오류 응답을 반환해야 한다', async () => {
    const expectValidationError = {
      property: 'property',
      value: 'value',
      message: ['testMessage'],
      paramType: 'body',
    };

    const requestDataValidationError = new RequestDataValidationException({
      validationErrors: [
        {
          property: 'property',
          constraints: {
            제약조건: 'testMessage',
          },
          value: 'value',
        },
      ],
      paramType: 'body',
    });

    filter.catch(requestDataValidationError, mockHost);

    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    expect(mockResponse.json).toHaveBeenCalledWith({
      code: HttpStatus.BAD_REQUEST,
      message: HttpStatus[HttpStatus.BAD_REQUEST],
      error: [expectValidationError],
    });
  });
});

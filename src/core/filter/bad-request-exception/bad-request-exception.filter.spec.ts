import { ArgumentsHost, BadRequestException, HttpStatus } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { RequestDataValidationError } from '@src/core/pipe/request-data-validation/request-data-validation-error';
import { ValidationErrorElement } from '@src/core/pipe/request-data-validation/validation-error-element';
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
    const validationErrorElement = new ValidationErrorElement({
      property: 'property',
      value: 'value',
      message: ['testMessage'],
      paramType: 'body',
    });

    const requestDataValidationError = new RequestDataValidationError({
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

    const badRequestException = new BadRequestException(
      requestDataValidationError,
    );

    filter.catch(badRequestException, mockHost);

    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    expect(mockResponse.json).toHaveBeenCalledWith([validationErrorElement]);
  });
});

import { ArgumentsHost, BadRequestException, HttpStatus } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { RequestDataValidationError } from '@src/core/pipe/request-data-validation/request-data-validation-error';
import { ValidationErrorElement } from '@src/core/pipe/request-data-validation/validation-error-element';
import { Response } from 'express';
import { BadRequestExceptionFilter } from './bad-request-exception.filter';

describe('BadRequestExceptionFilter', () => {
  let filter: BadRequestExceptionFilter;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BadRequestExceptionFilter],
    }).compile();

    filter = module.get<BadRequestExceptionFilter>(BadRequestExceptionFilter);
  });

  it('정의되어 있어야 한다', () => {
    expect(filter).toBeDefined();
  });

  it('BadRequestException을 처리하고 유효성 검사 오류 응답을 반환해야 한다', () => {
    const mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as Response;

    const mockArgumentsHost = {
      switchToHttp: jest.fn().mockReturnThis(),
      getResponse: jest.fn().mockReturnValue(mockResponse),
    } as unknown as ArgumentsHost;

    const mockValidationErrorElement: ValidationErrorElement = {
      field: 'testField',
      message: 'testMessage',
    };

    const mockRequestDataValidationError: RequestDataValidationError = {
      createValidationErrorResponseBody: jest
        .fn()
        .mockReturnValue([mockValidationErrorElement]),
    };

    const mockBadRequestException = new BadRequestException(
      mockRequestDataValidationError,
    );

    filter.catch(mockBadRequestException, mockArgumentsHost);

    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    expect(mockResponse.json).toHaveBeenCalledWith([
      mockValidationErrorElement,
    ]);
  });
});

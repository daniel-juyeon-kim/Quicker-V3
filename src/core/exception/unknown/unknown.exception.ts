import { HttpStatus } from '@nestjs/common';
import { ChatPostMessageResponse } from '@slack/web-api';
import { ErrorResponseBody } from '@src/core/module';
import { NaverSmsApiResponse } from '@src/core/module/external-api/sms-api/naver-sms-api.response';
import { plainToInstance } from 'class-transformer';
import { CustomException } from '../custom.exception';
import { UnknownExceptionResponseBody } from './unknown-exception-response-body';

export abstract class UnknownException extends CustomException {
  private static readonly value: string =
    HttpStatus[HttpStatus.INTERNAL_SERVER_ERROR];

  constructor(
    private readonly error:
      | ChatPostMessageResponse
      | NaverSmsApiResponse
      | ErrorResponseBody
      | Error,
    message: string,
    statusCode: HttpStatus,
  ) {
    super(UnknownException.value, message, statusCode);
  }

  getResponse(): UnknownExceptionResponseBody {
    return plainToInstance(UnknownExceptionResponseBody, this, {
      excludeExtraneousValues: true,
      exposeUnsetFields: false,
    });
  }
}

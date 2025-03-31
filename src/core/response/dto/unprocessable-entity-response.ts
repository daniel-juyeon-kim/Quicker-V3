import { HttpStatus } from '@nestjs/common';
import { ApiProperty, ApiUnprocessableEntityResponse } from '@nestjs/swagger';
import { ErrorDetail } from '@src/core/exception/database/error-detail';
import { ErrorResponseBody } from '@src/core/response';

class CommonUnprocessableEntityResponseBody extends ErrorResponseBody<ErrorDetail> {
  @ApiProperty({ example: HttpStatus.UNPROCESSABLE_ENTITY })
  readonly code: HttpStatus;
  @ApiProperty()
  readonly error: ErrorDetail;
}

export const ApiCommonUnprocessableEntityResponse =
  ApiUnprocessableEntityResponse({
    type: CommonUnprocessableEntityResponseBody,
  });

import { HttpStatus } from '@nestjs/common';
import { ApiInternalServerErrorResponse, ApiProperty } from '@nestjs/swagger';
import { ErrorResponseBody } from '@src/core/response';

class CommonInternalServerErrorResponseBody extends ErrorResponseBody<never> {
  @ApiProperty({ example: HttpStatus.INTERNAL_SERVER_ERROR })
  readonly code: HttpStatus;
}

export const ApiCommonInternalServerErrorResponse =
  ApiInternalServerErrorResponse({
    type: CommonInternalServerErrorResponseBody,
  });

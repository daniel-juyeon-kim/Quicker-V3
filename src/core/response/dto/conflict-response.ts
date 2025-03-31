import { HttpStatus } from '@nestjs/common';
import { ApiConflictResponse, ApiProperty } from '@nestjs/swagger';
import { ErrorDetail } from '@src/core/exception/database/error-detail';
import { ErrorResponseBody } from '@src/core/response';

class CommonConflictResponseBody extends ErrorResponseBody<ErrorDetail> {
  @ApiProperty({ example: HttpStatus.CONFLICT })
  readonly code: HttpStatus;
  @ApiProperty()
  readonly error: ErrorDetail;
}

export const ApiCommonConflictResponse = ApiConflictResponse({
  type: CommonConflictResponseBody,
});

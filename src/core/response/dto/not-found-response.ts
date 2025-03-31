import { HttpStatus } from '@nestjs/common';
import { ApiNotFoundResponse, ApiProperty } from '@nestjs/swagger';
import { ErrorDetail } from '@src/core/exception/database/error-detail';
import { ErrorResponseBody } from '@src/core/response';

class CommonNotFoundResponseBody extends ErrorResponseBody<ErrorDetail> {
  @ApiProperty({ example: HttpStatus.NOT_FOUND })
  readonly code: HttpStatus;
  @ApiProperty()
  readonly error: ErrorDetail;
}
export const ApiCommonNotFoundResponse = ApiNotFoundResponse({
  type: CommonNotFoundResponseBody,
});

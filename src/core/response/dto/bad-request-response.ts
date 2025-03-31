import { HttpStatus } from '@nestjs/common';
import { ApiBadRequestResponse, ApiProperty } from '@nestjs/swagger';
import { ValidationErrorDetail } from '@src/core/exception/request-data-validation-exception/validation-error-detail';
import { ErrorResponseBody } from '@src/core/response';

class CommonBadRequestResponseBody extends ErrorResponseBody<ValidationErrorDetail> {
  @ApiProperty({ example: HttpStatus.BAD_REQUEST })
  readonly code: HttpStatus;
  @ApiProperty({ description: '유효성 검사 실패 오류' })
  error: ValidationErrorDetail;
}

export const ApiCommonBadRequestResponse = ApiBadRequestResponse({
  type: CommonBadRequestResponseBody,
});

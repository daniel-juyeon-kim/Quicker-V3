import { HttpStatus } from '@nestjs/common';
import { ApiCreatedResponse, ApiProperty } from '@nestjs/swagger';
import { ResponseBody } from '@src/core/response';

class CommonCreatedResponseBody extends ResponseBody {
  @ApiProperty({ example: HttpStatus.CREATED })
  readonly code: HttpStatus;
}

export const ApiCommonCreatedResponse = ApiCreatedResponse({
  type: CommonCreatedResponseBody,
});

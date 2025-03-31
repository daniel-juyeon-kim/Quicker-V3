import { HttpStatus } from '@nestjs/common';
import { ApiOkResponse, ApiProperty } from '@nestjs/swagger';
import { ResponseBody } from '../response-body';

class CommonOkResponseBody extends ResponseBody {
  @ApiProperty({ example: HttpStatus.OK })
  readonly code: HttpStatus;
}

export const ApiCommonOkResponse = ApiOkResponse({
  type: CommonOkResponseBody,
});

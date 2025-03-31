import { HttpStatus } from '@nestjs/common';
import { ApiBadGatewayResponse, ApiProperty } from '@nestjs/swagger';
import { ErrorResponseBody } from '@src/core/response';

class CommonBadGatewayResponseBody extends ErrorResponseBody<never> {
  @ApiProperty({ example: HttpStatus.BAD_GATEWAY })
  readonly code: HttpStatus;
}

export const ApiCommonBadGatewayResponse = ApiBadGatewayResponse({
  type: CommonBadGatewayResponseBody,
});

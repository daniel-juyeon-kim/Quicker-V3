import { Controller, Get, Inject, Param, ParseIntPipe } from '@nestjs/common';
import { ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import { ServiceToken } from '@src/core/constant';
import { ApiCommonBadRequestResponse } from '@src/core/response/dto/bad-request-response';
import { ApiCommonInternalServerErrorResponse } from '@src/core/response/dto/internal-server-error-response';
import { ApiCommonNotFoundResponse } from '@src/core/response/dto/not-found-response';
import { OrderLocationResponseDto } from './dto/order-location.dto';
import { IOrderLocationService } from './order-location.service.interface';

@Controller('orders')
export class OrderLocationController {
  constructor(
    @Inject(ServiceToken.ORDER_LOCATION_SERVICE)
    private readonly orderLocationService: IOrderLocationService,
  ) {}

  @Get(':orderId/coordinates')
  @ApiOperation({
    summary: '출발지 및 도착지 좌표 조회',
    description: '특정 주문에 대한 출발지와 도착지 좌표 정보를 조회합니다.',
  })
  @ApiOkResponse({ type: OrderLocationResponseDto })
  @ApiCommonBadRequestResponse
  @ApiCommonNotFoundResponse
  @ApiCommonInternalServerErrorResponse
  async findDepartureDestinationCoordinates(
    @Param('orderId', ParseIntPipe) orderId: number,
  ) {
    return await this.orderLocationService.findDepartureDestinationByOrderId(
      orderId,
    );
  }
}

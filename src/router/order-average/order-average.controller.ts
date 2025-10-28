import { Controller, Get, Inject, Param, ParseIntPipe } from '@nestjs/common';
import { ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import { ServiceToken } from '@src/core/constant';
import { ApiCommonBadRequestResponse } from '@src/core/response/dto/bad-request-response';
import { ApiCommonInternalServerErrorResponse } from '@src/core/response/dto/internal-server-error-response';
import { OrderAverageCostResponseDto } from './dto/order-average-cost.dto';
import { IOrderAverageService } from './order-average.service.interface';

@Controller('orders/average')
export class OrderAverageController {
  constructor(
    @Inject(ServiceToken.ORDER_AVERAGE_SERVICE)
    private readonly orderAverageService: IOrderAverageService,
  ) {}

  @Get('cost/latest/:distance')
  @ApiOperation({
    summary: '최신 평균 의뢰금 조회',
    description: '특정 거리 단위에 해당하는 최신 평균 의뢰금 정보를 조회합니다.',
  })
  @ApiOkResponse({ type: OrderAverageCostResponseDto })
  @ApiCommonBadRequestResponse
  @ApiCommonInternalServerErrorResponse
  async findLatestAverageCost(
    @Param('distance', ParseIntPipe) distance: number,
  ) {
    return await this.orderAverageService.findLatestOrderAverageCostByDistance(
      distance,
    );
  }
}

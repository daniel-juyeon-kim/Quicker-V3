import { Controller, Get, Inject, Param, ParseIntPipe } from '@nestjs/common';
import { ServiceToken } from '@src/core/constant';
import { IOrderAverageService } from './order-average.service.interface';

@Controller('orders/average')
export class OrderAverageController {
  constructor(
    @Inject(ServiceToken.ORDER_AVERAGE_SERVICE)
    private readonly orderAverageService: IOrderAverageService,
  ) {}

  @Get('cost/latest/:distance')
  async findLatestAverageCost(
    @Param('distance', ParseIntPipe) distance: number,
  ) {
    return await this.orderAverageService.findLatestOrderAverageCostByDistance(
      distance,
    );
  }
}

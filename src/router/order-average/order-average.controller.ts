import { Controller, Get, Inject, ParseIntPipe, Query } from '@nestjs/common';
import { ServiceToken } from '@src/core/constant';
import { IOrderAverageService } from './order-average.service.interface';

@Controller('orders/average')
export class OrderAverageController {
  constructor(
    @Inject(ServiceToken.ORDER_AVERAGE_SERVICE)
    private readonly service: IOrderAverageService,
  ) {}

  @Get('cost/latest')
  async getLatestAverageCost(
    @Query('distance', ParseIntPipe) distance: number,
  ) {
    return await this.service.findLatestOrderAverageCost(distance);
  }
}

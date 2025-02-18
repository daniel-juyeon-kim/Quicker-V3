import { Controller, Get, Inject, Param, ParseIntPipe } from '@nestjs/common';
import { ServiceToken } from '@src/core/constant';
import { IOrderLocationService } from './order-location.service.interface';

@Controller('orders')
export class OrderLocationController {
  constructor(
    @Inject(ServiceToken.ORDER_LOCATION_SERVICE)
    private readonly orderLocationService: IOrderLocationService,
  ) {}

  @Get(':orderId/coordinates')
  async findDepartureDestinationCoordinates(
    @Param('orderId', ParseIntPipe) orderId: number,
  ) {
    return await this.orderLocationService.findDepartureDestinationByOrderId(
      orderId,
    );
  }
}

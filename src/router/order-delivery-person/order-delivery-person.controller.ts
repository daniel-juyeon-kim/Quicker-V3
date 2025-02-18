import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { ServiceToken } from '@src/core/constant';
import { CreateDeliveryPersonLocationDto } from './dto/create-order-delivery-person.dto';
import { UpdateDeliveryPersonLocationDto } from './dto/update-order-delivery-person.dto';
import { IOrderDeliveryPersonService } from './order-delivery-person.service.interface';

@Controller('orders')
export class OrderDeliveryPersonController {
  constructor(
    @Inject(ServiceToken.ORDER_DELIVERY_PERSON_SERVICE)
    private readonly orderDeliveryPersonService: IOrderDeliveryPersonService,
  ) {}

  @Get(':orderId/delivery-person/location')
  findDeliveryPersonCurrentLocation(
    @Param('orderId', ParseIntPipe) orderId: number,
  ) {
    return this.orderDeliveryPersonService.findCurrentLocationByOrderId(
      orderId,
    );
  }

  @Post('delivery-person/location')
  createDeliveryPersonCurrentLocation(
    @Body() dto: CreateDeliveryPersonLocationDto,
  ) {
    return this.orderDeliveryPersonService.createCurrentLocation(dto);
  }

  @Patch(':orderId/delivery-person')
  updateDeliveryPersonLocation(
    @Param('orderId', ParseIntPipe) orderId: number,
    @Body() { walletAddress }: UpdateDeliveryPersonLocationDto,
  ) {
    return this.orderDeliveryPersonService.matchDeliveryPersonAtOrder({
      orderId,
      walletAddress,
    });
  }
}

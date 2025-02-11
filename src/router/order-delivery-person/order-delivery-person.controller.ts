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
import { UpdateDeliveryPersonLocationDto } from './dto/update-order-delivery-person.dto';
import { IOrderDeliveryPersonService } from './order-delivery-person.service.interface';
import { CreateDeliveryPersonLocationDto } from './dto/create-order-delivery-person.dto';

@Controller('orders')
export class OrderDeliveryPersonController {
  constructor(
    @Inject(ServiceToken.ORDER_DELIVERY_PERSON_SERVICE)
    private readonly service: IOrderDeliveryPersonService,
  ) {}

  @Get(':orderId/delivery-person/location')
  findDeliveryPersonCurrentLocation(
    @Param('orderId', ParseIntPipe) orderId: number,
  ) {
    return this.service.findCurrentLocation(orderId);
  }

  @Post('delivery-person/location')
  createDeliveryPersonCurrentLocation(
    @Body() dto: CreateDeliveryPersonLocationDto,
  ) {
    return this.service.createDeliveryPersonCurrentLocation(dto);
  }

  @Patch(':orderId/delivery-person')
  updateDeliveryPersonLocation(
    @Param('orderId', ParseIntPipe) orderId: number,
    @Body() { walletAddress }: UpdateDeliveryPersonLocationDto,
  ) {
    return this.service.matchDeliveryPersonAtOrder({
      orderId,
      walletAddress,
    });
  }
}

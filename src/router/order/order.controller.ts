import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  ParseArrayPipe,
  Post,
  Query,
} from '@nestjs/common';
import { ARRAY_SEPARATOR, ServiceToken } from '@src/core/constant';
import { ValidateWalletAddressPipe } from '@src/core/pipe/wallet-address-pipe/wallet-address.pipe';
import { CreateOrderDto } from './dto/create-order.dto';
import { IOrderService } from './order.service.interface';

@Controller('orders')
export class OrderController {
  constructor(
    @Inject(ServiceToken.ORDER_SERVICE)
    private readonly service: IOrderService,
  ) {}

  @Post()
  async create(@Body() createOrderDto: CreateOrderDto) {
    await this.service.createOrder(createOrderDto);
  }

  @Get('matchable')
  async findAllMatchableOrder(
    @Query('walletAddress', ValidateWalletAddressPipe) walletAddress: string,
  ) {
    return await this.service.findAllMatchableOrder(walletAddress);
  }

  @Get(':orderIds/detail')
  async findAllOrderDetail(
    @Param(
      'orderIds',
      new ParseArrayPipe({ items: Number, separator: ARRAY_SEPARATOR }),
    )
    orderIds: number[],
  ) {
    return await this.service.findAllOrderDetail(orderIds);
  }
}

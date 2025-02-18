import {
  Body,
  Controller,
  Get,
  Inject,
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
    private readonly orderService: IOrderService,
  ) {}

  @Post()
  async createOrder(@Body() createOrderDto: CreateOrderDto) {
    await this.orderService.createOrder(createOrderDto);
  }

  @Get('matchable')
  async findAllMatchableOrder(
    @Query('walletAddress', ValidateWalletAddressPipe) walletAddress: string,
  ) {
    return await this.orderService.findAllMatchableOrderByWalletAddress(
      walletAddress,
    );
  }

  @Get('detail')
  async findAllOrderDetail(
    @Query(
      'orderIds',
      new ParseArrayPipe({ items: Number, separator: ARRAY_SEPARATOR }),
    )
    orderIds: number[],
  ) {
    return await this.orderService.findAllOrderDetailByOrderIds(orderIds);
  }
}

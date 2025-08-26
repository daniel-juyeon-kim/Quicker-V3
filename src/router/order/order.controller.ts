import {
  Body,
  Controller,
  Get,
  Inject,
  ParseArrayPipe,
  Post,
  Query,
} from '@nestjs/common';
import { ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import { ARRAY_SEPARATOR, ServiceToken } from '@src/core/constant';
import { ValidateWalletAddressPipe } from '@src/core/pipe/wallet-address-pipe/wallet-address.pipe';
import { ApiCommonBadRequestResponse } from '@src/core/response/dto/bad-request-response';
import { ApiCommonCreatedResponse } from '@src/core/response/dto/created-response';
import { ApiCommonInternalServerErrorResponse } from '@src/core/response/dto/internal-server-error-response';
import { ApiCommonNotFoundResponse } from '@src/core/response/dto/not-found-response';
import { CreateOrderDto } from './dto/create-order.dto';
import { MatchableOrderResponseDto } from './dto/matchable-order.dto';
import { OrderDetailResponseDto } from './dto/order-detail.dto';
import { IOrderService } from './order.service.interface';

@Controller('orders')
export class OrderController {
  constructor(
    @Inject(ServiceToken.ORDER_SERVICE)
    private readonly orderService: IOrderService,
  ) {}

  @Post()
  @ApiOperation({ description: '주문 생성' })
  @ApiCommonCreatedResponse
  @ApiCommonBadRequestResponse
  @ApiCommonNotFoundResponse
  @ApiCommonInternalServerErrorResponse
  async createOrder(@Body() createOrderDto: CreateOrderDto) {
    await this.orderService.createOrder(createOrderDto);
  }

  @Get('matchable')
  @ApiOperation({
    description: '배송원의 지갑 주소로 수락 가능한 모든 주문을 조회',
  })
  @ApiOkResponse({ type: MatchableOrderResponseDto })
  @ApiCommonBadRequestResponse
  @ApiCommonNotFoundResponse
  @ApiCommonInternalServerErrorResponse
  async findAllMatchableOrder(
    @Query('walletAddress', ValidateWalletAddressPipe) walletAddress: string,
    @Query('skipNumber') skipNumber: number,
  ) {
    return await this.orderService.findAllMatchableOrderByWalletAddress(
      walletAddress,
      skipNumber,
    );
  }

  @Get('detail')
  @ApiOperation({
    description:
      '의뢰인으로 주문을 생성했거나 배송원으로 배송 완료한 주문들의 세부 정보를 가지고 옴',
  })
  @ApiOkResponse({ type: OrderDetailResponseDto })
  @ApiCommonBadRequestResponse
  @ApiCommonInternalServerErrorResponse
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

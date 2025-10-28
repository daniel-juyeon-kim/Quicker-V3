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
import { ApiCommonBadRequestResponse } from '@src/core/response/dto/bad-request-response';
import { ApiCommonCreatedResponse } from '@src/core/response/dto/created-response';
import { ApiCommonInternalServerErrorResponse } from '@src/core/response/dto/internal-server-error-response';
import { ApiCommonNotFoundResponse } from '@src/core/response/dto/not-found-response';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderDetailResponseDto } from './dto/order-detail.dto';
import { MatchableOrderResponseDto } from './dto/unmached-order.dto';
import { IOrderService } from './order.service.interface';

@Controller('orders')
export class OrderController {
  constructor(
    @Inject(ServiceToken.ORDER_SERVICE)
    private readonly orderService: IOrderService,
  ) {}

  @Post()
  @ApiOperation({
    summary: '의뢰 생성',
    description: '새로운 배송 의뢰을 생성합니다.',
  })
  @ApiCommonCreatedResponse
  @ApiCommonBadRequestResponse
  @ApiCommonNotFoundResponse
  @ApiCommonInternalServerErrorResponse
  async createOrder(@Body() createOrderDto: CreateOrderDto) {
    await this.orderService.createOrder(createOrderDto);
  }

  @Get('matchable')
  @ApiOperation({
    summary: '매칭 가능한 의뢰 조회',
    description: '매칭되지 않은 모든 의뢰을 조회합니다.',
  })
  @ApiOkResponse({ type: MatchableOrderResponseDto })
  @ApiCommonBadRequestResponse
  @ApiCommonNotFoundResponse
  @ApiCommonInternalServerErrorResponse
  async findAllMatchableOrder(
    @Query('lastCheckedOrderId') lastCheckedOrderId: number,
  ) {
    return await this.orderService.findAllUnmatchedOrder(lastCheckedOrderId);
  }

  @Get('detail')
  @ApiOperation({
    summary: '의뢰 상세 정보 조회',
    description:
      '의뢰인으로 생성했거나 배송 완료한 의뢰들의 상세 정보를 조회합니다.',
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

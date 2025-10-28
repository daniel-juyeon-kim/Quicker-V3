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
import { ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import { ServiceToken } from '@src/core/constant';
import { ApiCommonBadGatewayResponse } from '@src/core/response/dto/bad-gateway-response';
import { ApiCommonBadRequestResponse } from '@src/core/response/dto/bad-request-response';
import { ApiCommonConflictResponse } from '@src/core/response/dto/conflict-response';
import { ApiCommonCreatedResponse } from '@src/core/response/dto/created-response';
import { ApiCommonInternalServerErrorResponse } from '@src/core/response/dto/internal-server-error-response';
import { ApiCommonNotFoundResponse } from '@src/core/response/dto/not-found-response';
import { ApiCommonOkResponse } from '@src/core/response/dto/ok-response';
import { ApiCommonUnprocessableEntityResponse } from '@src/core/response/dto/unprocessable-entity-response';
import {
  OrderDeliveryPersonLocationDto,
  OrderDeliveryPersonLocationResponseDto,
} from './dto/order-delivery-person-location.dto';
import { UpdateDeliveryPersonLocationDto } from './dto/update-order-delivery-person.dto';
import { IOrderDeliveryPersonService } from './order-delivery-person.service.interface';

@Controller('orders')
export class OrderDeliveryPersonController {
  constructor(
    @Inject(ServiceToken.ORDER_DELIVERY_PERSON_SERVICE)
    private readonly orderDeliveryPersonService: IOrderDeliveryPersonService,
  ) {}

  @Get(':orderId/delivery-person/location')
  @ApiOperation({
    summary: '배송원 현재 위치 조회',
    description: '특정 주문에 대한 배송원의 현재 위치 정보를 조회합니다.',
  })
  @ApiOkResponse({ type: OrderDeliveryPersonLocationResponseDto })
  @ApiCommonBadRequestResponse
  @ApiCommonNotFoundResponse
  @ApiCommonInternalServerErrorResponse
  async findDeliveryPersonCurrentLocation(
    @Param('orderId', ParseIntPipe) orderId: number,
  ) {
    return await this.orderDeliveryPersonService.findCurrentLocationByOrderId(
      orderId,
    );
  }

  @Post(':orderId/delivery-person/location')
  @ApiOperation({
    summary: '배송원 위치 정보 저장',
    description: '특정 주문에 대한 배송원의 위치 정보를 저장합니다.',
  })
  @ApiCommonCreatedResponse
  @ApiCommonBadRequestResponse
  @ApiCommonInternalServerErrorResponse
  async createDeliveryPersonCurrentLocation(
    @Param('orderId', ParseIntPipe) orderId: number,
    @Body() dto: OrderDeliveryPersonLocationDto,
  ) {
    await this.orderDeliveryPersonService.createCurrentLocation({
      ...dto,
      orderId,
    });
  }

  @Patch(':orderId/delivery-person')
  @ApiOperation({
    summary: '의뢰 수락 및 배송원 정보 업데이트',
    description:
      '의뢰 정보에 배송원 정보를 추가하고, 수취인에게 배송 정보가 포함된 URL을 메시지로 전송합니다.',
  })
  @ApiCommonOkResponse
  @ApiCommonBadRequestResponse
  @ApiCommonNotFoundResponse
  @ApiCommonConflictResponse
  @ApiCommonUnprocessableEntityResponse
  @ApiCommonInternalServerErrorResponse
  @ApiCommonBadGatewayResponse
  async updateDeliveryPersonLocation(
    @Param('orderId', ParseIntPipe) orderId: number,
    @Body() { walletAddress }: UpdateDeliveryPersonLocationDto,
  ) {
    await this.orderDeliveryPersonService.matchDeliveryPerson({
      orderId,
      walletAddress,
    });
  }
}

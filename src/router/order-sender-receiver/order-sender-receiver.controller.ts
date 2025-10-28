import { Controller, Get, Inject, Param, ParseIntPipe } from '@nestjs/common';
import { ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import { ServiceToken } from '@src/core/constant';
import { ApiCommonBadRequestResponse } from '@src/core/response/dto/bad-request-response';
import { ApiCommonInternalServerErrorResponse } from '@src/core/response/dto/internal-server-error-response';
import { ApiCommonNotFoundResponse } from '@src/core/response/dto/not-found-response';
import { OrderSenderReceiverResponseDto } from './dto/order-sender-receiver.dto';
import { IOrderSenderReceiverService } from './order-sender-receiver.service.interface';

@Controller('orders')
export class OrderSenderReceiverController {
  constructor(
    @Inject(ServiceToken.ORDER_SENDER_RECEIVER_SERVICE)
    private readonly orderSenderReceiverService: IOrderSenderReceiverService,
  ) {}

  @Get(':orderId/sender-receiver')
  @ApiOperation({
    summary: '발송인 및 수취인 정보 조회',
    description: '특정 주문에 대한 출발지, 도착지, 발송인, 수취인 정보를 조회합니다.',
  })
  @ApiOkResponse({ type: OrderSenderReceiverResponseDto })
  @ApiCommonBadRequestResponse
  @ApiCommonNotFoundResponse
  @ApiCommonInternalServerErrorResponse
  async findSenderReceiverLocationAndPhoneNumber(
    @Param('orderId', ParseIntPipe) orderId: number,
  ) {
    return await this.orderSenderReceiverService.findSenderReceiverLocationAndPhoneNumberByOrderId(
      orderId,
    );
  }
}

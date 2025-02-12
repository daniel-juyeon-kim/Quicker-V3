import { Controller, Get, Inject, Param, ParseIntPipe } from '@nestjs/common';
import { ServiceToken } from '@src/core/constant';
import { SenderReceiverInfoService } from './sender-receiver-info.service';

@Controller('orders')
export class SenderReceiverInfoController {
  constructor(
    @Inject(ServiceToken.SENDER_RECEIVER_INFO_SERVICE)
    private readonly service: SenderReceiverInfoService,
  ) {}

  @Get(':orderId/sender-receiver-info')
  getSenderReceiverInfo(@Param('orderId', ParseIntPipe) orderId: number) {
    return this.service.findSenderReceiverInfo(orderId);
  }
}

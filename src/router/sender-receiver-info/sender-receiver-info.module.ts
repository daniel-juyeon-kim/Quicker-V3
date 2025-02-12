import { Module } from '@nestjs/common';
import { ServiceToken } from '@src/core/constant';
import { SenderReceiverInfoController } from './sender-receiver-info.controller';
import { SenderReceiverInfoService } from './sender-receiver-info.service';

@Module({
  controllers: [SenderReceiverInfoController],
  providers: [
    {
      provide: ServiceToken.SENDER_RECEIVER_INFO_SERVICE,
      useClass: SenderReceiverInfoService,
    },
  ],
})
export class SenderReceiverInfoModule {}

import { Module } from '@nestjs/common';
import { ServiceToken } from '@src/core/constant';
import { OrderCompleteImageService } from './order-complete-image/order-complete-image.service';
import { OrderFailImageService } from './order-fail-image/order-fail-image.service';
import { OrderImageController } from './order-image.controller';

@Module({
  controllers: [OrderImageController],
  providers: [
    {
      provide: ServiceToken.ORDER_FAIL_IMAGE_SERVICE,
      useClass: OrderFailImageService,
    },
    {
      provide: ServiceToken.ORDER_COMPLETE_IMAGE_SERVICE,
      useClass: OrderCompleteImageService,
    },
  ],
})
export class OrderImageModule {}

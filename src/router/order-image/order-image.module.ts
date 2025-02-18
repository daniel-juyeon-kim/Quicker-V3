import { Module } from '@nestjs/common';
import { ServiceToken } from '@src/core/constant';
import { OrderImageController } from './order-image.controller';
import { OrderCompleteImageService } from './service/order-complete-image/order-complete-image.service';
import { OrderFailImageService } from './service/order-fail-image/order-fail-image.service';

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

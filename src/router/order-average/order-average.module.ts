import { Module } from '@nestjs/common';
import { ServiceToken } from '@src/core/constant';
import { OrderAverageController } from './order-average.controller';
import { OrderAverageService } from './order-average.service';

@Module({
  controllers: [OrderAverageController],
  providers: [
    {
      provide: ServiceToken.ORDER_AVERAGE_SERVICE,
      useClass: OrderAverageService,
    },
  ],
})
export class OrderAverageModule {}

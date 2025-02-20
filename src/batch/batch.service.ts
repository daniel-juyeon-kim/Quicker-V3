import { Inject, Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { CoreToken } from '@src/core/constant';
import { ErrorMessage, ErrorMessageBot, TmapApi } from '@src/core/module';
import { Blockchain } from '@src/core/module/blockchain/blockchain.interface';
import { OrderPrice } from '@src/core/module/blockchain/order-price';
import { Distance } from '@src/core/module/external-api/tmap-api/distance';
import { AverageCostEntity } from '@src/database';
import { BatchToken } from './constant/constant';
import { IRepository } from './repository/repository.service.interface';
import { OrderCountTable } from './table/order-count-table/order-count-table';
import { OrderPriceSumTable } from './table/order-price-sum-table/order-price-sum-table';

@Injectable()
export class BatchService {
  constructor(
    @Inject(CoreToken.ERROR_MESSAGE_BOT)
    private readonly errorMessageBot: ErrorMessageBot,
    @Inject(BatchToken.REPOSITORY)
    private readonly repository: IRepository,
    private readonly tmapApi: TmapApi,
    @Inject(CoreToken.BLOCKCHAIN)
    private readonly blockChain: Blockchain,
  ) {}

  @Cron('0 3 1 * *', { timeZone: 'Asia/Seoul' })
  async run() {
    try {
      const date = new Date();

      const { prices, distances } = await this.findDistancePriceByDate(date);

      const orders = this.joinByOrderId({ prices, distances });

      const averageCostEntity = this.createAverageCostEntity(orders);

      await this.repository.saveAverageCost(averageCostEntity);
    } catch (exception) {
      const errorMessage = new ErrorMessage({
        exception,
        date: new Date(),
      });
      await this.errorMessageBot.sendMessage(errorMessage);
    }
  }

  private async findDistancePriceByDate(date: Date) {
    const orderIds =
      await this.repository.findAllLastMonthOrderIdByCurrentMonth(date);

    const departureDestination =
      await this.repository.findAllDepartureDestinationByOrderIds(orderIds);
    const prices = await this.blockChain.findAllOrderPriceByOrderIds(orderIds);
    const distances =
      await this.tmapApi.requestRouteDistances(departureDestination);

    return { prices, distances };
  }

  private joinByOrderId({
    prices,
    distances,
  }: {
    prices: OrderPrice[];
    distances: Distance[];
  }) {
    return distances.map((distance) => ({
      distance: distance.distance,
      price: prices.find((price) => price.orderNumber === distance.orderId)
        .price,
    }));
  }

  private createAverageCostEntity(
    orders: { distance: number; price: number }[],
  ) {
    const countTable = new OrderCountTable(orders);
    const sumTable = new OrderPriceSumTable(orders);
    const averageCostEntity = new AverageCostEntity({ countTable, sumTable });

    return averageCostEntity;
  }
}

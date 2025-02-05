import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { klaytnConfig } from '@src/config/configs';
import Caver, { Contract } from 'caver-js';
import { isFulfilled } from '../util';
import { Blockchain } from './blockchain.interface';
import {
  QUICKER_DLVR_PROXY_ABI,
  QUICKER_DLVR_PROXY_ADDRESS,
} from './klaytnApi/ContractInfo';
import { OrderPrice } from './order-price';

@Injectable()
export class Klaytn implements Blockchain {
  private readonly contract: Contract;

  constructor(configService: ConfigService<ReturnType<typeof klaytnConfig>>) {
    this.contract = new Caver(
      configService.get('baobobProvider'),
    ).contract.create(QUICKER_DLVR_PROXY_ABI, QUICKER_DLVR_PROXY_ADDRESS);
  }

  public async findOrderPrices(orderIds: number[]) {
    const blockChainOrders = orderIds.map(async (orderId) => {
      const { orderNumber, orderPrice } = await this.findOrderPrice(orderId);

      return new OrderPrice(parseInt(orderNumber), parseInt(orderPrice));
    });

    const orderPrices = await Promise.allSettled(blockChainOrders);

    return this.filterFulfilled(orderPrices);
  }

  private async findOrderPrice(
    id: number,
  ): Promise<{ orderNumber: string; orderPrice: string }> {
    return await this.contract.call('orderList', id);
  }

  private filterFulfilled(
    promiseOrderPrices: PromiseSettledResult<OrderPrice>[],
  ) {
    return promiseOrderPrices.map((promiseOrderPrice) =>
      this.pickFulfilled(promiseOrderPrice),
    );
  }

  private pickFulfilled(promiseOrderPrice: PromiseSettledResult<OrderPrice>) {
    if (isFulfilled(promiseOrderPrice)) {
      return promiseOrderPrice.value;
    }
  }
}

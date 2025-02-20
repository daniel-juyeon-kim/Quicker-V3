import { OrderPrice } from './order-price';

export interface Blockchain {
  findAllOrderPriceByOrderIds(
    orderIds: number[],
  ): Promise<(OrderPrice | undefined)[]>;
}

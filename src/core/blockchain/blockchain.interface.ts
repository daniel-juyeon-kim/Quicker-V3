import { OrderPrice } from './order-price';

export interface Blockchain {
  findOrderPrices(orderIds: number[]): Promise<(OrderPrice | undefined)[]>;
}

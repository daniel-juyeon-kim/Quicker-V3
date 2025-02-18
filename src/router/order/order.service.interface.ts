import { OrderEntity } from '@src/database';
import { DeepPartial } from 'typeorm';
import { CreateOrderDto } from './dto/create-order.dto';

export interface IOrderService {
  createOrder(dto: CreateOrderDto): Promise<void>;
  findAllOrderDetailByOrderIds(
    orderIds: number[],
  ): Promise<DeepPartial<OrderEntity[]>>;
  findAllMatchableOrderByWalletAddress(
    walletAddress: string,
  ): Promise<DeepPartial<OrderEntity[]>>;
}

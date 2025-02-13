import { OrderEntity } from '@src/database';
import { DeepPartial } from 'typeorm';
import { CreateOrderDto } from './dto/create-orders.dto';

export interface IOrdersService {
  createOrder(dto: CreateOrderDto): Promise<void>;
  findAllOrderDetailByOrderIds(
    orderIds: number[],
  ): Promise<DeepPartial<OrderEntity[]>>;
  findAllMatchableOrderByWalletAddress(
    walletAddress: string,
  ): Promise<DeepPartial<OrderEntity[]>>;
}

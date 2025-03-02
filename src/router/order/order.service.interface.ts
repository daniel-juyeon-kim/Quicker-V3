import { CreateOrderDto } from './dto/create-order.dto';
import { MatchableOrderDto } from './dto/matchable-order.dto';
import { OrderDetailDto } from './dto/order-detail.dto';

export interface IOrderService {
  createOrder(dto: CreateOrderDto): Promise<void>;
  findAllOrderDetailByOrderIds(orderIds: number[]): Promise<OrderDetailDto[]>;
  findAllMatchableOrderByWalletAddress(
    walletAddress: string,
  ): Promise<MatchableOrderDto[]>;
}

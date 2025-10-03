import { CreateOrderDto } from './dto/create-order.dto';
import { OrderDetailDto } from './dto/order-detail.dto';
import { MatchableOrderDto } from './dto/unmached-order.dto';

export interface IOrderService {
  createOrder(dto: CreateOrderDto): Promise<void>;
  findAllOrderDetailByOrderIds(orderIds: number[]): Promise<OrderDetailDto[]>;
  findAllUnmatchedOrder(
    lastCheckedOrderId: number,
  ): Promise<MatchableOrderDto[]>;
}

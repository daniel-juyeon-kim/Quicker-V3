import { OrderDetailDto } from '@src/router/order/dto/order-detail.dto';
import { MatchableOrderDto } from '@src/router/order/dto/unmached-order.dto';

export interface IOrderQueryRepository {
  findRequesterIdByOrderId(orderId: number): Promise<string>;
  findAllOrderDetailsByIds(orderIds: number[]): Promise<OrderDetailDto[]>;
  findAllUnmatchedOrder(skipNumber: number): Promise<MatchableOrderDto[]>;
}

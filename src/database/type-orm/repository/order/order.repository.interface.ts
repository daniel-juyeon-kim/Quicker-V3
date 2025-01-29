import { EntityManager } from 'typeorm';
import { TRANSPORTATION_ALLOW_VALUES } from '../../../../../validator/schema/routes/order/custom-validator';
import { OrderControllerRequestData } from '../../../../../validator/schema/routes/order/order-controller-request-data';
import { Order } from '../../entity';

type BasicTransportationEntity = {
  transportation: Record<(typeof TRANSPORTATION_ALLOW_VALUES)[number], 1 | 0>;
};

export interface IOrderRepository {
  findAllCreatedOrDeliveredOrderDetailByOrderIds(
    orderIds: number[],
  ): Promise<Order[]>;
  findAllMatchableOrderByWalletAddress(walletAddress: string): Promise<Order[]>;
  updateDeliveryPersonAtOrder(
    manager: EntityManager,
    arg0: { orderId: number; walletAddress: string },
  ): Promise<void>;
  create(
    body: Omit<OrderControllerRequestData['createOrder'], 'transportation'> &
      BasicTransportationEntity,
  ): Promise<void>;
}

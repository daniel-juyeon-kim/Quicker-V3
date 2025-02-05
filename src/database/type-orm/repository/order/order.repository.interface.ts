import { EntityManager } from 'typeorm';
import { OrderEntity } from '../../entity';

export interface IOrderRepository {
  findAllCreatedOrDeliveredOrderDetailByOrderIds(
    orderIds: number[],
  ): Promise<OrderEntity[]>;
  findAllMatchableOrderByWalletAddress(
    walletAddress: string,
  ): Promise<OrderEntity[]>;
  updateDeliveryPersonAtOrder(
    manager: EntityManager,
    deliveryPerson: { orderId: number; walletAddress: string },
  ): Promise<void>;
  create(order: {
    walletAddress: string;
    detail?: string;
    transportation: Record<TransportationUnion, 1 | 0>;
    product: Product;
    destination: Location;
    departure: Location;
    sender: DeliverParticipant;
    receiver: DeliverParticipant;
  }): Promise<void>;
}

interface Location {
  x: number;
  y: number;
}
interface DeliverParticipant {
  name: string;
  phone: string;
}
type TransportationUnion =
  | 'bicycle'
  | 'bike'
  | 'car'
  | 'scooter'
  | 'truck'
  | 'walking';

interface Product {
  width: number;
  length: number;
  height: number;
  weight: number;
}

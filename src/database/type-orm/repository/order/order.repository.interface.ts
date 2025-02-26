import { DeepPartial } from 'typeorm';
import { OrderEntity } from '../../entity';

export interface IOrderRepository {
  findAllCreatedOrDeliveredOrderDetailByOrderIds(
    orderIds: number[],
  ): Promise<DeepPartial<OrderEntity>[]>;
  findAllMatchableOrderByWalletAddress(
    walletAddress: string,
  ): Promise<Partial<OrderEntity[]>>;
  updateDeliveryPersonAtOrder(deliveryPerson: {
    orderId: number;
    walletAddress: string;
  }): Promise<void>;
  createOrder(order: {
    walletAddress: string;
    detail?: string;
    transportation: Partial<Record<TransportationUnion, 1 | 0>>;
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

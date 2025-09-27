import { OrderDetailDto } from '@src/router/order/dto/order-detail.dto';
import { MatchableOrderDto } from '@src/router/order/dto/unmached-order.dto';

export interface IOrderRepository {
  findAllCreatedOrDeliveredOrderDetailByOrderIds(
    orderIds: number[],
  ): Promise<OrderDetailDto[]>;
  findAllMatchableOrderByWalletAddress(
    walletAddress: string,
    skipNumber: number,
  ): Promise<MatchableOrderDto[]>;
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

export interface IOrderRepository {
  updateDeliveryPersonId(dto: UpdateDeliveryPersonDto): Promise<void>;
  createOrder(dto: CreateOrderDto): Promise<void>;
}

interface CreateOrderDto {
  walletAddress: string;
  detail?: string;
  transportation: Partial<Record<TransportationUnion, 1 | 0>>;
  product: Product;
  destination: Location;
  departure: Location;
  sender: DeliverParticipant;
  receiver: DeliverParticipant;
}

interface UpdateDeliveryPersonDto {
  orderId: number;
  deliveryPersonId: string;
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

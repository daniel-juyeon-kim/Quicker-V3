import { OrderDeliveryPersonLocationDto } from './dto/order-delivery-person-location.dto';

export interface IOrderDeliveryPersonService {
  findCurrentLocationByOrderId(
    orderId: number,
  ): Promise<OrderDeliveryPersonLocationDto>;

  createCurrentLocation({
    orderId,
    x,
    y,
  }: OrderDeliveryPersonLocationDto & { orderId: number }): Promise<void>;

  matchDeliveryPersonAtOrder({
    orderId,
    walletAddress,
  }: {
    orderId: number;
    walletAddress: string;
  }): Promise<void>;
}

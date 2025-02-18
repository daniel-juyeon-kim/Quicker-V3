import { Location } from '@src/database';

export interface IOrderDeliveryPersonService {
  findCurrentLocationByOrderId(orderId: number): Promise<Location>;

  createCurrentLocation({
    orderId,
    x,
    y,
  }: {
    x: number;
    y: number;
    orderId: number;
  }): Promise<void>;

  matchDeliveryPersonAtOrder({
    orderId,
    walletAddress,
  }: {
    orderId: number;
    walletAddress: string;
  }): Promise<void>;
}

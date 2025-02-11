import { Location } from '@src/database';

export interface IOrderDeliveryPersonService {
  findCurrentLocation(orderId: number): Promise<Location>;

  createDeliveryPersonCurrentLocation({
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

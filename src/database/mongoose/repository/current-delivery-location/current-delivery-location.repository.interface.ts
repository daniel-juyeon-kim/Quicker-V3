import { Location } from '../../models/current-deliver-location';

export interface ICurrentDeliveryLocationRepository {
  saveDeliveryPersonLocation(
    orderId: number,
    location: Location,
  ): Promise<void>;

  findCurrentLocationByOrderId(orderId: number): Promise<Location>;
}

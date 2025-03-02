import { OrderDeliveryPersonLocationDto } from '@src/router/order-delivery-person/dto/order-delivery-person-location.dto';
import { Location } from '../../models/current-deliver-location';

export interface ICurrentDeliveryLocationRepository {
  saveDeliveryPersonLocation(
    orderId: number,
    location: Location,
  ): Promise<void>;

  findCurrentLocationByOrderId(
    orderId: number,
  ): Promise<OrderDeliveryPersonLocationDto>;
}

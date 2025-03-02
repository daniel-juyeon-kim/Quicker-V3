import { OrderLocationDto } from '@src/router/order-location/dto/order-location.dto';

export interface ILocationRepository {
  findDestinationDepartureByOrderId(orderId: number): Promise<OrderLocationDto>;
  findAllDestinationDepartureByOrderIds(
    orderIds: number[],
  ): Promise<OrderLocationDto[]>;
}

import { OrderLocationDto } from './dto/order-location.dto';

export interface IOrderLocationService {
  findDepartureDestinationByOrderId(orderId: number): Promise<OrderLocationDto>;
}

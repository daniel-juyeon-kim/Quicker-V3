import { OrderAverageCostDto } from './dto/order-average-cost.dto';

export interface IOrderAverageService {
  findLatestOrderAverageCostByDistance(
    distance: number,
  ): Promise<OrderAverageCostDto>;
}

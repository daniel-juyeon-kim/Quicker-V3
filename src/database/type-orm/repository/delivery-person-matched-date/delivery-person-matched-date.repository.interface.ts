import { EntityManager } from 'typeorm';

export interface IDeliveryPersonMatchedDateRepository {
  create(manager: EntityManager, orderId: number): Promise<void>;
  findAllOrderIdByBetweenDates(
    startDate: Date,
    endDate: Date,
  ): Promise<{ id: number }[]>;
}

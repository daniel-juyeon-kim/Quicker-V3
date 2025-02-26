export interface IDeliveryPersonMatchedDateRepository {
  create(orderId: number): Promise<void>;
  findAllOrderIdByBetweenDates(
    startDate: Date,
    endDate: Date,
  ): Promise<{ id: number }[]>;
}

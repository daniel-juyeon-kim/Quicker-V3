export type DestinationDepartureLocation = {
  id: number;
  departure: { x: number; y: number };
  destination: { x: number; y: number };
};

export interface ILocationRepository {
  findDestinationDepartureByOrderId(
    orderId: number,
  ): Promise<DestinationDepartureLocation>;

  findAllDestinationDepartureByOrderId(
    orderIds: number[],
  ): Promise<DestinationDepartureLocation[]>;
}

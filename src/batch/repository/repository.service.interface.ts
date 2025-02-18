import { AverageCostEntity } from '@src/database';

export interface IRepository {
  findAllLastMonthOrderIdByCurrentMonth(currentDate: Date): Promise<number[]>;
  findAllDepartureDestinationByOrderIds(orderIds: number[]): Promise<
    {
      id: number;
      departure: { x: number; y: number };
      destination: { x: number; y: number };
    }[]
  >;
  saveAverageCost(averageCostEntity: AverageCostEntity): Promise<void>;
}

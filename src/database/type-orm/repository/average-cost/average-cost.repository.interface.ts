export interface IAverageCostRepository {
  findAverageCostByDateAndDistanceUnit({
    distanceUnit,
    lastMonth,
  }: {
    distanceUnit: AverageCostDistanceUnion;
    lastMonth: Date;
  }): Promise<number>;

  createAverage(
    averageCost: Record<AverageCostDistanceUnion, number>,
    date: Date,
  ): Promise<void>;
}

export type AverageCostDistanceUnion =
  | '5KM'
  | '10KM'
  | '15KM'
  | '20KM'
  | '25KM'
  | '30KM'
  | '40KM'
  | '50KM'
  | '60KM'
  | '60+KM';

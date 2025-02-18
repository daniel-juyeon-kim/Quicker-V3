export interface IOrderAverageService {
  findLatestOrderAverageCostByDistance(
    distance: number,
  ): Promise<{ averageCost: number }>;
}

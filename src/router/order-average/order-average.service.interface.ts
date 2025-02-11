export interface IOrderAverageService {
  findLatestOrderAverageCost(
    distance: number,
  ): Promise<{ averageCost: number }>;
}

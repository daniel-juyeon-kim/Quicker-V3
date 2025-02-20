import { DistanceTableEntity } from '@src/database/type-orm/entity/distance-table.entity';

export class OrderCountTable extends DistanceTableEntity {
  constructor(
    orders: {
      distance: number;
      price: number;
    }[],
  ) {
    super();

    orders.forEach(({ distance }) => {
      const COUNT = 1;
      const key = this.findKey(distance);

      this[key] += COUNT;
    });
  }
}

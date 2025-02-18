import { DistanceTableEntity } from '@src/database/type-orm/entity/distance-table.entity';

export class OrderPriceSumTable extends DistanceTableEntity {
  constructor(
    orders: {
      distance: number;
      price: number;
    }[],
  ) {
    super();

    orders.forEach(({ distance, price }) => {
      const key = this.findKey(distance);

      this[key] += price;
    });
  }
}

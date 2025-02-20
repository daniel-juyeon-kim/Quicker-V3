import { OrderCountTable } from '@src/batch/table/order-count-table/order-count-table';
import { OrderPriceSumTable } from '@src/batch/table/order-price-sum-table/order-price-sum-table';
import { isZero } from '@src/core/util';
import { Entity, PrimaryColumn } from 'typeorm';
import { DistanceTableEntity } from './distance-table.entity';

@Entity({ name: 'averageCost' })
export class AverageCostEntity extends DistanceTableEntity {
  @PrimaryColumn({ type: 'datetime' })
  'date': Date;

  constructor();

  constructor(params: {
    sumTable: OrderPriceSumTable;
    countTable: OrderCountTable;
  });

  constructor(params?: {
    sumTable: OrderPriceSumTable;
    countTable: OrderCountTable;
  }) {
    super();

    if (params) {
      this.setAverageCost(params);
    }
  }

  private setAverageCost({
    sumTable,
    countTable,
  }: {
    sumTable: OrderPriceSumTable;
    countTable: OrderCountTable;
  }) {
    for (const key in sumTable) {
      const sum = sumTable[key];
      const count = countTable[key];

      if (isZero(sum) || isZero(count)) {
        continue;
      }

      this[key] = Math.floor(sum / count);
    }
  }
}

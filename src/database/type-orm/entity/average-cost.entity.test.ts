import { OrderCountTable } from '@src/batch/table/order-count-table/order-count-table';
import { OrderPriceSumTable } from '@src/batch/table/order-price-sum-table/order-price-sum-table';
import { AverageCostEntity } from './average-cost.entity';

describe('AverageCostEntity', () => {
  it('생성자 테스트 - 파라미터가 없는 경우', () => {
    const entity = new AverageCostEntity();

    expect(entity).toEqual({
      '10KM': 0,
      '15KM': 0,
      '20KM': 0,
      '25KM': 0,
      '30KM': 0,
      '40KM': 0,
      '50KM': 0,
      '5KM': 0,
      '60+KM': 0,
      '60KM': 0,
    });
  });

  it('생성자 테스트 - 파라미터가 있는 경우', () => {
    const orders = [
      { price: 10, distance: 5 },
      { price: 20, distance: 16 },
      { price: 23, distance: 20 },
      { price: 190, distance: 50 },
      { price: 161, distance: 51 },
      { price: 177, distance: 55 },
      { price: 110, distance: 60 },
    ];
    const countTable = new OrderCountTable(orders);
    const sumTable = new OrderPriceSumTable(orders);

    const entity = new AverageCostEntity({ sumTable, countTable });

    expect(entity).toEqual({
      '5KM': 10,
      '10KM': 0,
      '15KM': 0,
      '20KM': 21,
      '25KM': 0,
      '30KM': 0,
      '40KM': 0,
      '50KM': 190,
      '60KM': 149,
      '60+KM': 0,
    });
  });
});

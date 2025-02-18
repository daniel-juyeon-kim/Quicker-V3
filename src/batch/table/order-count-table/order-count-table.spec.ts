import { OrderCountTable } from './order-count-table';

describe('OrderCountTable', () => {
  it('경계값 테스트, 거리 기준값과 거리가 같으면 해당됨(이하)', () => {
    const orders = [
      { distance: 4, price: 100 },
      { distance: 5, price: 100 },
      { distance: 6, price: 100 },
      { distance: 10, price: 100 },
      { distance: 20, price: 200 },
      { distance: 59, price: 150 },
      { distance: 60, price: 150 },
      { distance: 61, price: 150 },
    ];
    const orderCountTable = new OrderCountTable(orders);

    expect(orderCountTable).toEqual({
      '5KM': 2,
      '10KM': 2,
      '15KM': 0,
      '20KM': 1,
      '25KM': 0,
      '30KM': 0,
      '40KM': 0,
      '50KM': 0,
      '60KM': 2,
      '60+KM': 1,
    });
  });

  it('빈 주문 배열은 속성이 전부 0', () => {
    const orders = [];
    const orderCountTable = new OrderCountTable(orders);

    expect(orderCountTable).toEqual({
      '5KM': 0,
      '10KM': 0,
      '15KM': 0,
      '20KM': 0,
      '25KM': 0,
      '30KM': 0,
      '40KM': 0,
      '50KM': 0,
      '60KM': 0,
      '60+KM': 0,
    });
  });
});

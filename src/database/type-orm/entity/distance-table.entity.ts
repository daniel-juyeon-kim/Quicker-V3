import { isUndefined } from '@src/core/util';
import { Column } from 'typeorm';

export abstract class DistanceTableEntity {
  @Column({ default: 0 })
  '5KM': number;

  @Column({ default: 0 })
  '10KM': number;

  @Column({ default: 0 })
  '15KM': number;

  @Column({ default: 0 })
  '20KM': number;

  @Column({ default: 0 })
  '25KM': number;

  @Column({ default: 0 })
  '30KM': number;

  @Column({ default: 0 })
  '40KM': number;

  @Column({ default: 0 })
  '50KM': number;

  @Column({ default: 0 })
  '60KM': number;

  @Column({ default: 0 })
  '60+KM': number;

  constructor() {
    const ZERO = 0;

    const properties = [
      '5KM',
      '10KM',
      '15KM',
      '20KM',
      '25KM',
      '30KM',
      '40KM',
      '50KM',
      '60KM',
      '60+KM',
    ];
    properties.forEach((property) => (this[property] = ZERO));
  }

  protected findKey(distance: number): keyof DistanceTableEntity {
    const DISTANCE_UNITS = [5, 10, 15, 20, 25, 30, 40, 50, 60] as const;

    const unit: (typeof DISTANCE_UNITS)[number] = DISTANCE_UNITS.find(
      (unit) => distance <= unit,
    );

    return isUndefined(unit) ? '60+KM' : `${unit}KM`;
  }
}

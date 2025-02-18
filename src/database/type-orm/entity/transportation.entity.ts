import { Column, Entity, JoinColumn, OneToOne, PrimaryColumn } from 'typeorm';
import { OrderEntity } from '.';

@Entity({ name: 'transportation' })
export class TransportationEntity {
  @PrimaryColumn()
  id: number;

  @Column('tinyint', { default: 0 })
  walking: 1 | 0;

  @Column('tinyint', { default: 0 })
  bicycle: 1 | 0;

  @Column('tinyint', { default: 0 })
  scooter: 1 | 0;

  @Column('tinyint', { default: 0 })
  bike: 1 | 0;

  @Column('tinyint', { default: 0 })
  car: 1 | 0;

  @Column('tinyint', { default: 0 })
  truck: 1 | 0;

  @OneToOne(() => OrderEntity, (order) => order.transportation, {
    cascade: ['insert'],
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'id' })
  order: OrderEntity;
}

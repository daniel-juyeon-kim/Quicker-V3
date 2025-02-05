import { Column, Entity, JoinColumn, OneToOne, PrimaryColumn } from 'typeorm';
import { OrderEntity } from '.';

@Entity({ name: 'transportation' })
export class TransportationEntity {
  @PrimaryColumn()
  id!: number;

  @Column('tinyint')
  walking!: 1 | 0;

  @Column('tinyint')
  bicycle!: 1 | 0;

  @Column('tinyint')
  scooter!: 1 | 0;

  @Column('tinyint')
  bike!: 1 | 0;

  @Column('tinyint')
  car!: 1 | 0;

  @Column('tinyint')
  truck!: 1 | 0;

  @OneToOne(() => OrderEntity, (order) => order.transportation, {
    cascade: ['insert'],
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'id' })
  order!: OrderEntity;
}

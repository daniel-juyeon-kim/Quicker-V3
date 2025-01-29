import { Column, Entity, JoinColumn, OneToOne, PrimaryColumn } from 'typeorm';
import { Order } from '.';

@Entity()
export class Transportation {
  @PrimaryColumn()
  id!: number;

  @Column('tinyint')
  walking!: number;

  @Column('tinyint')
  bicycle!: number;

  @Column('tinyint')
  scooter!: number;

  @Column('tinyint')
  bike!: number;

  @Column('tinyint')
  car!: number;

  @Column('tinyint')
  truck!: number;

  @OneToOne(() => Order, (order) => order.transportation, {
    cascade: ['insert'],
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'id' })
  order!: Order;
}

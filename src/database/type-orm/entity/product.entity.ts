import { Column, Entity, JoinColumn, OneToOne, PrimaryColumn } from 'typeorm';
import { Order } from '.';

@Entity()
export class Product {
  @PrimaryColumn()
  id!: number;

  @Column()
  width!: number;

  @Column()
  length!: number;

  @Column()
  height!: number;

  @Column()
  weight!: number;

  @OneToOne(() => Order, (order) => order.product, {
    cascade: ['insert'],
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'id' })
  order!: Order;
}

export type BasicProduct = Omit<Product, 'id' | 'order'>;

import { Column, Entity, JoinColumn, OneToOne, PrimaryColumn } from 'typeorm';
import { OrderEntity } from '.';

@Entity({ name: 'product' })
export class ProductEntity {
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

  @OneToOne(() => OrderEntity, (order) => order.product, {
    cascade: ['insert'],
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'id' })
  order!: OrderEntity;
}

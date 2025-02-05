import { Column, Entity, JoinColumn, OneToOne, PrimaryColumn } from 'typeorm';
import { OrderEntity } from '.';

@Entity({ name: 'deliveryPersonMatchedDate' })
export class DeliveryPersonMatchedDateEntity {
  @PrimaryColumn()
  id!: number;

  @Column({
    type: 'datetime',
    default: () => 'CURRENT_TIMESTAMP',
    nullable: true,
  })
  date!: Date | null;

  @OneToOne(() => OrderEntity, (order) => order.deliveryPersonMatchedDate, {
    cascade: ['insert'],
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'id' })
  order!: OrderEntity;
}

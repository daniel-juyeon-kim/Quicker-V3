import { Column, Entity, JoinColumn, OneToOne, PrimaryColumn } from 'typeorm';
import { Order } from '.';

export interface DeliveryPersonMatchedDate {
  id: number;
  date: Date | null;
}

@Entity()
export class DeliveryPersonMatchedDateEntity
  implements DeliveryPersonMatchedDate
{
  @PrimaryColumn()
  id!: number;

  @Column({
    type: 'datetime',
    default: () => 'CURRENT_TIMESTAMP',
    nullable: true,
  })
  date!: Date | null;

  @OneToOne(() => Order, (order) => order.deliveryPersonMatchedDate, {
    cascade: ['insert'],
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'id' })
  order!: Order;
}

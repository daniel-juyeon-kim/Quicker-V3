import { Column, Entity, JoinColumn, OneToOne, PrimaryColumn } from 'typeorm';
import { Order, Sender } from '.';

@Entity()
export class Departure {
  @PrimaryColumn()
  id!: number;

  @Column('double')
  x!: number;

  @Column('double')
  y!: number;

  @Column()
  detail!: string;

  @OneToOne(() => Order, (order) => order.destination, {
    cascade: ['insert'],
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'id' })
  order!: Order;

  @OneToOne(() => Sender, (sender) => sender.departure, {
    cascade: ['insert'],
  })
  sender!: Sender;
}

export type BasicDeparture = Omit<Departure, 'id' | 'order' | 'sender'>;

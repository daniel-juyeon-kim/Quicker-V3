import { Column, Entity, JoinColumn, OneToOne, PrimaryColumn } from 'typeorm';
import { Order, Receiver } from '.';

@Entity()
export class Destination {
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

  @OneToOne(() => Receiver, (receiver) => receiver.destination, {
    cascade: ['insert'],
  })
  receiver!: Receiver;
}

export type BasicDestination = Omit<Destination, 'id' | 'order' | 'receiver'>;

import { Column, Entity, JoinColumn, OneToOne, PrimaryColumn } from 'typeorm';
import { OrderEntity, ReceiverEntity } from '.';

@Entity({ name: 'destination' })
export class DestinationEntity {
  @PrimaryColumn()
  id: number;

  @Column('double')
  x: number;

  @Column('double')
  y: number;

  @Column()
  detail: string;

  @OneToOne(() => OrderEntity, (order) => order.destination, {
    cascade: ['insert'],
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'id' })
  order: OrderEntity;

  @OneToOne(() => ReceiverEntity, (receiver) => receiver.destination, {
    cascade: ['insert'],
  })
  receiver: ReceiverEntity;
}

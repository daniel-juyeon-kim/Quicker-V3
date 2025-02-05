import { Column, Entity, JoinColumn, OneToOne, PrimaryColumn } from 'typeorm';
import { OrderEntity, SenderEntity } from '.';

@Entity({ name: 'departure' })
export class DepartureEntity {
  @PrimaryColumn()
  id!: number;

  @Column('double')
  x!: number;

  @Column('double')
  y!: number;

  @Column()
  detail!: string;

  @OneToOne(() => OrderEntity, (order) => order.destination, {
    cascade: ['insert'],
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'id' })
  order!: OrderEntity;

  @OneToOne(() => SenderEntity, (sender) => sender.departure, {
    cascade: ['insert'],
  })
  sender!: SenderEntity;
}

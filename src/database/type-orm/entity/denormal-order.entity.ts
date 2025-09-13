import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { UserEntity } from '.';
import { OrderParticipantEntity } from './order-participant.entity';

@Entity({ name: 'order', orderBy: { id: 'DESC' } })
@Index('idx_requester_orderId', ['requester', 'id'])
export class DenormalOrderEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => UserEntity, (user) => user.requestOrder, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  requester: UserEntity;

  @ManyToOne(() => UserEntity, (user) => user.deliverOrder, {
    nullable: true,
  })
  @JoinColumn()
  deliveryPerson: UserEntity | null;

  @OneToOne(() => OrderParticipantEntity, (participant) => participant.order, {
    nullable: false,
    onDelete: 'CASCADE',
    cascade: ['insert'],
  })
  @JoinColumn()
  participant: OrderParticipantEntity;

  @Column({ nullable: true })
  detail?: string;

  @Column('tinyint', { default: 0 })
  walking: 1 | 0;

  @Column('tinyint', { default: 0 })
  bicycle: 1 | 0;

  @Column('tinyint', { default: 0 })
  scooter: 1 | 0;

  @Column('tinyint', { default: 0 })
  bike: 1 | 0;

  @Column('tinyint', { default: 0 })
  car: 1 | 0;

  @Column('tinyint', { default: 0 })
  truck: 1 | 0;

  @Column()
  width: number;

  @Column()
  length: number;

  @Column()
  height: number;

  @Column()
  weight: number;

  @Column('double')
  destinationX: number;

  @Column('double')
  destinationY: number;

  @Column()
  destinationDetail: string;

  @Column('double')
  departureX: number;

  @Column('double')
  departureY: number;

  @Column()
  departureDetail: string;

  @Column({ type: 'datetime', nullable: true })
  deliveryPersonMatchedDate: Date | null;
}

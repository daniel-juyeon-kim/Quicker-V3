import { Column, Entity, OneToOne, PrimaryColumn } from 'typeorm';
import { DenormalOrderEntity } from './denormal-order.entity';

@Entity({ name: 'order_participant' })
export class OrderParticipantEntity {
  @PrimaryColumn()
  id: number;

  @Column()
  senderName: string;

  @Column()
  senderPhone: string;

  @Column()
  receiverName: string;

  @Column()
  receiverPhone: string;

  @OneToOne(() => DenormalOrderEntity, (order) => order.participant, {
    cascade: ['insert'],
  })
  order: DenormalOrderEntity;
}

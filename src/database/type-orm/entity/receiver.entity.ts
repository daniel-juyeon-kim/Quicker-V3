import { Column, Entity, JoinColumn, OneToOne, PrimaryColumn } from 'typeorm';
import { DestinationEntity } from '.';

@Entity({ name: 'receiver' })
export class ReceiverEntity {
  @PrimaryColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  phone: string;

  @OneToOne(() => DestinationEntity, (destination) => destination.receiver, {
    cascade: ['insert'],
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'id' })
  destination: DestinationEntity;
}

import { Column, Entity, JoinColumn, OneToOne, PrimaryColumn } from 'typeorm';
import { DepartureEntity } from '.';

@Entity({ name: 'sender' })
export class SenderEntity {
  @PrimaryColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  phone: string;

  @OneToOne(() => DepartureEntity, (departure) => departure.sender, {
    cascade: ['insert'],
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'id' })
  departure: DepartureEntity;
}

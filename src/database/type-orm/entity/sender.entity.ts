import { Column, Entity, JoinColumn, OneToOne, PrimaryColumn } from 'typeorm';
import { Departure } from '.';

@Entity()
export class Sender {
  @PrimaryColumn()
  id!: number;

  @Column()
  name!: string;

  @Column()
  phone!: string;

  @OneToOne(() => Departure, (departure) => departure.sender, {
    cascade: ['insert'],
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'id' })
  departure!: Departure;
}

export type BasicSender = Omit<Sender, 'id' | 'departure'>;

import { Column, Entity, JoinColumn, OneToOne, PrimaryColumn } from 'typeorm';
import { Destination } from '.';

@Entity()
export class Receiver {
  @PrimaryColumn()
  id!: number;

  @Column()
  name!: string;

  @Column()
  phone!: string;

  @OneToOne(() => Destination, (destination) => destination.receiver, {
    cascade: ['insert'],
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'id' })
  destination!: Destination;
}

export type BasicRecipient = Omit<Receiver, 'id' | 'destination'>;

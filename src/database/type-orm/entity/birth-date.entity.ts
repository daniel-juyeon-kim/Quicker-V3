import { Column, Entity, JoinColumn, OneToOne, PrimaryColumn } from 'typeorm';
import { User } from '.';

export type BasicBirthDate = Omit<BirthDate, 'user'>;

@Entity()
export class BirthDate {
  @PrimaryColumn()
  id!: string;

  @Column({ type: 'date' })
  date!: Date;

  @OneToOne(() => User, (user) => user.birthDate, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  @JoinColumn({ name: 'id' })
  user!: User;
}

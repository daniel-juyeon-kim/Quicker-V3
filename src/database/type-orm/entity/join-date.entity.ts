import { Column, Entity, JoinColumn, OneToOne, PrimaryColumn } from 'typeorm';
import { User } from '.';

@Entity()
export class JoinDate {
  @PrimaryColumn()
  id!: string;

  @Column('datetime', { default: new Date().toISOString() })
  date!: Date;

  @OneToOne(() => User, (user) => user.joinDate, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  @JoinColumn({ name: 'id' })
  user!: User;
}

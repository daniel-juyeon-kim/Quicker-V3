import { Column, Entity, JoinColumn, OneToOne, PrimaryColumn } from 'typeorm';
import { UserEntity } from '.';

@Entity({ name: 'joinDate' })
export class JoinDateEntity {
  @PrimaryColumn()
  id: string;

  @Column('datetime', { default: new Date().toISOString() })
  date: Date;

  @OneToOne(() => UserEntity, (user) => user.joinDate, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  @JoinColumn({ name: 'id' })
  user: UserEntity;
}

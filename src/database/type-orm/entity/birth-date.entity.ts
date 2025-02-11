import { Column, Entity, JoinColumn, OneToOne, PrimaryColumn } from 'typeorm';
import { UserEntity } from '.';

@Entity({ name: 'birthDate' })
export class BirthDateEntity {
  @PrimaryColumn()
  id: string;

  @Column({ type: 'date' })
  date: Date;

  @OneToOne(() => UserEntity, (user) => user.birthDate, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  @JoinColumn({ name: 'id' })
  user: UserEntity;
}

import { Column, Entity, JoinColumn, OneToOne, PrimaryColumn } from 'typeorm';
import { User } from '.';

@Entity()
export class ProfileImage {
  @PrimaryColumn()
  id!: string;

  @Column({ default: '404' })
  imageId!: string;

  @OneToOne(() => User, (user) => user.profileImage, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'id' })
  user!: User;
}

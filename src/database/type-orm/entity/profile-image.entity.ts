import { Column, Entity, JoinColumn, OneToOne, PrimaryColumn } from 'typeorm';
import { UserEntity } from '.';

@Entity({ name: 'profileImage' })
export class ProfileImageEntity {
  @PrimaryColumn()
  id: string;

  @Column({ default: '404' })
  imageId: string;

  @OneToOne(() => UserEntity, (user) => user.profileImage, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'id' })
  user: UserEntity;
}

import { Column, Entity, OneToMany, OneToOne, PrimaryColumn } from 'typeorm';
import {
  BirthDateEntity,
  DenormalOrderEntity,
  JoinDateEntity,
  ProfileImageEntity,
} from '.';

@Entity({ name: 'user' })
export class UserEntity {
  @PrimaryColumn()
  id: string;

  @Column({ unique: true })
  walletAddress: string;

  @Column()
  name: string;

  @Column()
  email: string;

  @Column({ unique: true })
  contact: string;

  @OneToOne(() => ProfileImageEntity, (profileImage) => profileImage.user, {
    cascade: ['insert'],
  })
  profileImage: ProfileImageEntity;

  @OneToOne(() => JoinDateEntity, (joinDate) => joinDate.user, {
    cascade: ['insert'],
  })
  joinDate: JoinDateEntity;

  @OneToOne(() => BirthDateEntity, (birthDate) => birthDate.user, {
    cascade: ['insert'],
  })
  birthDate: BirthDateEntity;

  @OneToMany(() => DenormalOrderEntity, (order) => order.requester)
  requestOrder: DenormalOrderEntity[];

  @OneToMany(() => DenormalOrderEntity, (order) => order.deliveryPerson)
  deliverOrder: DenormalOrderEntity[];
}

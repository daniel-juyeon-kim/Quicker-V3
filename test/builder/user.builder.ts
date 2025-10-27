import {
  BirthDateEntity,
  JoinDateEntity,
  ProfileImageEntity,
  UserEntity,
} from '@src/database/type-orm/entity';

export class UserBuilder {
  private readonly user: UserEntity;

  constructor() {
    this.user = new UserEntity();
    this.user.id = 'default-user-id';
    this.user.walletAddress = 'default-wallet-address';
    this.user.name = '테스트유저';
    this.user.email = 'test@email.com';
    this.user.contact = '010-1234-5678';

    this.user.birthDate = new BirthDateEntity();
    this.user.profileImage = new ProfileImageEntity();
    this.user.joinDate = new JoinDateEntity();

    this.user.profileImage.id = this.user.id;
    this.user.birthDate.id = this.user.id;
    this.user.birthDate.date = new Date(2000, 9, 12);
    this.user.joinDate.id = this.user.id;
    this.user.joinDate.date = new Date(2023, 9, 12);
  }

  withId(id: string): this {
    this.user.id = id;
    this.user.profileImage.id = id;
    this.user.birthDate.id = id;
    this.user.joinDate.id = id;

    return this;
  }

  withWalletAddress(walletAddress: string): this {
    this.user.walletAddress = walletAddress;

    return this;
  }

  withContact(contact: string): this {
    this.user.contact = contact;

    return this;
  }

  withName(name: string): this {
    this.user.name = name;

    return this;
  }

  withEmail(email: string): this {
    this.user.email = email;

    return this;
  }

  withProfileImageId(imageId: string): this {
    this.user.profileImage.imageId = imageId;

    return this;
  }

  build(): UserEntity {
    return this.user;
  }
}

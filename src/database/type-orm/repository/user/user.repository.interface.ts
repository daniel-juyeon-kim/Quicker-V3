import { ProfileImageEntity, UserEntity } from '../../entity';

export interface IUserRepository {
  create(body: { id: string; user: User; birthDate: Date }): Promise<void>;
  updateUserProfileImageIdByWalletAddress(body: {
    imageId: string;
    walletAddress: string;
  }): Promise<void>;
  findNameByWalletAddress(walletAddress: string): Promise<UserEntity>;
  findUserProfileImageIdByWalletAddress(
    walletAddress: string,
  ): Promise<ProfileImageEntity>;
}

interface User {
  walletAddress: string;
  name: string;
  email: string;
  contact: string;
}

import { UserNameDto } from '@src/router/user/dto/user-name.dto';
import { UserProfileImageIdDto } from '@src/router/user/dto/user-profile-image-id.dto';

export interface IUserRepository {
  createUser(body: { id: string; user: User; birthDate: Date }): Promise<void>;
  updateUserProfileImageIdByWalletAddress(body: {
    imageId: string;
    walletAddress: string;
  }): Promise<void>;
  findNameByWalletAddress(walletAddress: string): Promise<UserNameDto>;
  findUserProfileImageIdByWalletAddress(
    walletAddress: string,
  ): Promise<UserProfileImageIdDto>;
}

interface User {
  walletAddress: string;
  name: string;
  email: string;
  contact: string;
}

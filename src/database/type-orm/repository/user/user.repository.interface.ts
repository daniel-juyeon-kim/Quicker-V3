import { UserNameDto } from '@src/router/user/dto/user-name.dto';
import { UserProfileImageIdDto } from '@src/router/user/dto/user-profile-image-id.dto';

export interface IUserRepository {
  createUser(dto: CreateUserDto): Promise<void>;
  updateUserProfileImageIdByWalletAddress(body: {
    imageId: string;
    walletAddress: string;
  }): Promise<void>;
  findIdByWalletAddress(walletAddress: string): Promise<string>;
  findNameByWalletAddress(walletAddress: string): Promise<UserNameDto>;
  findProfileImageIdByWalletAddress(
    walletAddress: string,
  ): Promise<UserProfileImageIdDto>;
}

interface CreateUserDto {
  id: string;
  user: {
    walletAddress: string;
    name: string;
    email: string;
    contact: string;
  };

  birthDate: Date;
}

import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserNameDto } from './dto/user-name.dto';
import { UserProfileImageIdDto } from './dto/user-profile-image-id.dto';

export interface IUserService {
  createUser(body: CreateUserDto): Promise<void>;
  findUserNameByWalletAddress(walletAddress: string): Promise<UserNameDto>;
  findUserProfileImageIdByWalletAddress(
    walletAddress: string,
  ): Promise<UserProfileImageIdDto>;
  updateUserProfileImageId(
    dto: { walletAddress: string } & UpdateUserDto,
  ): Promise<void>;
}

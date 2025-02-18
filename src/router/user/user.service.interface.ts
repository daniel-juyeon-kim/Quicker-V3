import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

export interface IUserService {
  createUser(body: CreateUserDto): Promise<void>;
  findUserNameByWalletAddress(walletAddress: string): Promise<{ name: string }>;
  findUserProfileImageIdByWalletAddress(
    walletAddress: string,
  ): Promise<{ imageId: string }>;
  updateUserProfileImageId(
    dto: { walletAddress: string } & UpdateUserDto,
  ): Promise<void>;
}

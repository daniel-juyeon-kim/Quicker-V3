import { CreateUsersDto } from './dto/create-users.dto';
import { UpdateUsersDto } from './dto/update-users.dto';

export interface IUsersService {
  createUser(body: CreateUsersDto): Promise<void>;
  findUserNameByWalletAddress(walletAddress: string): Promise<{ name: string }>;
  findUserProfileImageIdByWalletAddress(
    walletAddress: string,
  ): Promise<{ imageId: string }>;
  updateUserProfileImageId(
    dto: { walletAddress: string } & UpdateUsersDto,
  ): Promise<void>;
}

import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

export interface IUserService {
  createUser(body: CreateUserDto): Promise<void>;
  findUserNameByWalletAddress(walletAddress: string): Promise<{ name: string }>;
  findUserImageId(walletAddress: string): Promise<{ imageId: string }>;
  updateUserImageId(dto: UpdateUserDto): Promise<void>;
}

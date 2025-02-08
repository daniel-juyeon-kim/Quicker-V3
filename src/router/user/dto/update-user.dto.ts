import { IsEthereumAddress, IsNumberString } from 'class-validator';

export class UpdateUserDto {
  @IsEthereumAddress()
  walletAddress: string;

  @IsNumberString()
  imageId: string;
}

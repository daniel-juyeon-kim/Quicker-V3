import { IsEthereumAddress } from 'class-validator';

export class UpdateDeliveryPersonLocationDto {
  @IsEthereumAddress()
  walletAddress: string;
}

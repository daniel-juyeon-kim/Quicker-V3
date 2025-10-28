import { ApiProperty } from '@nestjs/swagger';
import { IsEthereumAddress } from 'class-validator';

export class UpdateDeliveryPersonLocationDto {
  @ApiProperty({ description: '배송원의 지갑 주소' })
  @IsEthereumAddress()
  walletAddress: string;
}

import { Type } from 'class-transformer';
import {
  IsDate,
  IsEmail,
  IsEthereumAddress,
  IsPhoneNumber,
  IsString,
} from 'class-validator';
import 'reflect-metadata';

export class CreateUsersDto {
  @IsEthereumAddress()
  walletAddress: string;

  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsPhoneNumber('KR')
  contact: string;

  // TODO: 나이제한 추가
  @Type(() => Date)
  @IsDate()
  birthDate: Date;
}

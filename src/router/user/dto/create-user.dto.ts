import { Type } from 'class-transformer';
import {
  IsDate,
  IsEmail,
  IsEthereumAddress,
  IsPhoneNumber,
  IsString,
} from 'class-validator';
import 'reflect-metadata';

export class CreateUserDto {
  @IsEthereumAddress()
  walletAddress: string;

  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsPhoneNumber('KR')
  contact: string;

  @Type(() => Date)
  @IsDate()
  birthDate: Date;
}

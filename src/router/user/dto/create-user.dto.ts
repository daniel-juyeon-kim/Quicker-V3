import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsEmail,
  IsEthereumAddress,
  IsNotEmpty,
  IsPhoneNumber,
  IsString,
  MaxDate,
  MinDate,
} from 'class-validator';
import 'reflect-metadata';

const MAX_YEAR = 100;
const MIN_YEAR = 10;
const ERROR_MESSAGE_OUT_OF_REGISTRABLE_AGE_RANGE = `${MIN_YEAR}세 이상 ${MAX_YEAR}세 이하만 가입 가능합니다.`;

export class CreateUserDto {
  @ApiProperty({ description: '사용자의 고유 지갑 주소' })
  @IsEthereumAddress()
  walletAddress: string;

  @ApiProperty({ description: '사용자의 이름' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ description: '사용자의 이메일 주소' })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({ description: '사용자의 연락처 (휴대폰 번호)' })
  @IsNotEmpty()
  @IsPhoneNumber('KR')
  contact: string;

  @ApiProperty({ description: '사용자의 생년월일 (YYYY-MM-DD 형식)' })
  @Type(() => Date)
  @MinDate(
    () => {
      const now = new Date();
      const minDate = new Date();

      minDate.setFullYear(now.getFullYear() - MAX_YEAR);
      minDate.setMilliseconds(now.getMilliseconds() - 1);

      return minDate;
    },
    { message: ERROR_MESSAGE_OUT_OF_REGISTRABLE_AGE_RANGE },
  )
  @MaxDate(
    () => {
      const now = new Date();
      const maxDate = new Date();

      maxDate.setFullYear(now.getFullYear() - MIN_YEAR);

      return maxDate;
    },
    { message: ERROR_MESSAGE_OUT_OF_REGISTRABLE_AGE_RANGE },
  )
  birthDate: Date;
}

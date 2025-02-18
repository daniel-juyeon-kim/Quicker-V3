import { IsNumberString } from 'class-validator';

export class UpdateUserDto {
  @IsNumberString()
  imageId: string;
}

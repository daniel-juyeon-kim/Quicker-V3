import { IsNumberString } from 'class-validator';

export class UpdateUsersDto {
  @IsNumberString()
  imageId: string;
}

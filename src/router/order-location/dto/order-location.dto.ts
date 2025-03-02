import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, IsPositive, ValidateNested } from 'class-validator';

class Location {
  @ApiProperty()
  @IsNumber()
  x: number;

  @ApiProperty()
  @IsNumber()
  y: number;
}

export class OrderLocationDto {
  @ApiProperty()
  @IsPositive()
  id: number;

  @ApiProperty({ type: Location })
  @ValidateNested()
  @Type(() => Location)
  departure: Location;

  @ApiProperty({ type: Location })
  @ValidateNested()
  @Type(() => Location)
  destination: Location;
}

import { ApiProperty } from '@nestjs/swagger';
import { ResponseBody } from '@src/core/response';
import { ImageBufferDto } from './image-buffer.dto';

export class FindCompleteDeliveryImageDto extends ImageBufferDto {}

export class FindCompleteDeliveryImageResponseDto extends ResponseBody {
  @ApiProperty()
  data: FindCompleteDeliveryImageDto;
}

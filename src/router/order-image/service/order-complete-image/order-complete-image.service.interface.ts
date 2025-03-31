import { Buffer } from 'buffer';
import { FindCompleteDeliveryImageDto } from '../../dto/find-complete-image.dto';

export interface IOrderCompleteImageService {
  findCompleteImageBufferByOrderId(
    orderId: number,
  ): Promise<FindCompleteDeliveryImageDto>;
  createCompleteImageBuffer(params: {
    orderId: number;
    image: Buffer;
  }): Promise<void>;
}

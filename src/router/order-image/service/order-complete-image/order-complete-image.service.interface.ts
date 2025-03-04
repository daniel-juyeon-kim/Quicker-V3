import { Buffer } from 'buffer';
import { OrderCompleteImageDto } from '../../dto/order-complete-image.dto';

export interface IOrderCompleteImageService {
  findCompleteImageBufferByOrderId(
    orderId: number,
  ): Promise<OrderCompleteImageDto>;
  createCompleteImageBuffer(params: {
    orderId: number;
    buffer: Buffer;
  }): Promise<void>;
}

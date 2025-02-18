import { Buffer } from 'buffer';

export interface IOrderCompleteImageService {
  findCompleteImageBufferByOrderId(
    orderId: number,
  ): Promise<{ buffer: Buffer }>;
  createCompleteImageBuffer(params: {
    orderId: number;
    buffer: Buffer;
  }): Promise<void>;
}

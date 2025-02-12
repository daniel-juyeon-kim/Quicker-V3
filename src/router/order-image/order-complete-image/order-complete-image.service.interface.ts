import { Buffer } from 'buffer';

export interface IOrderCompleteImageService {
  findCompleteImageBuffer(orderId: number): Promise<{ buffer: Buffer }>;
  createCompleteImageBuffer(params: {
    orderId: number;
    buffer: Buffer;
  }): Promise<void>;
}

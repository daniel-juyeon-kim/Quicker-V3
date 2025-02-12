import { FailDeliveryImage } from '@src/database';

export interface IOrderFailImageService {
  findOrderFailImage(orderId: number): Promise<FailDeliveryImage>;
  createFailImage(params: {
    orderId: number;
    reason: string;
    file: Express.Multer.File;
  }): Promise<void>;
}

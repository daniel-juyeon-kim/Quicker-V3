import { FailDeliveryImage } from '@src/database';

export interface IOrderFailImageService {
  findOrderFailImageByOrderId(orderId: number): Promise<FailDeliveryImage>;
  createFailImage(params: {
    orderId: number;
    reason: string;
    file: Express.Multer.File;
  }): Promise<void>;
}

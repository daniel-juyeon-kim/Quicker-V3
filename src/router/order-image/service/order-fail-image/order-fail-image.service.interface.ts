import { FailDeliveryImageDto } from '../../dto/order-fail-image.dto';

export interface IOrderFailImageService {
  findOrderFailImageByOrderId(orderId: number): Promise<FailDeliveryImageDto>;
  createFailImage(params: {
    orderId: number;
    reason: string;
    file: Express.Multer.File;
  }): Promise<void>;
}

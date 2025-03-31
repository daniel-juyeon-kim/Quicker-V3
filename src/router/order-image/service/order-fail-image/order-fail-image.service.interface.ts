import { FindFailDeliveryImageDto } from '../../dto/find-fail-image.dto';

export interface IOrderFailImageService {
  findOrderFailImageByOrderId(
    orderId: number,
  ): Promise<FindFailDeliveryImageDto>;

  createFailImage(params: {
    orderId: number;
    reason: string;
    image: Buffer;
  }): Promise<void>;
}

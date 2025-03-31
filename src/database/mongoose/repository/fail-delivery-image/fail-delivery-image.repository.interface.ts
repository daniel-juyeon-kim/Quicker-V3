import { FindFailDeliveryImageDto } from '@src/router/order-image/dto/find-fail-image.dto';

export interface IFailDeliveryImageRepository {
  createFailDeliveryImage({
    orderId,
    image,
    reason,
  }: {
    orderId: number;
    image: Buffer;
    reason: string;
  }): Promise<void>;

  findFailDeliveryImageByOrderId(
    orderId: number,
  ): Promise<FindFailDeliveryImageDto>;
}

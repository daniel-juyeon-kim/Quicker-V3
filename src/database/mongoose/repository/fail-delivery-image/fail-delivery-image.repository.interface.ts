import { FailDeliveryImageDto } from '@src/router/order-image/dto/order-fail-image.dto';

export interface IFailDeliveryImageRepository {
  createFailDeliveryImage({
    orderId,
    bufferImage,
    reason,
  }: {
    orderId: number;
    bufferImage: Buffer;
    reason: string;
  }): Promise<void>;

  findFailDeliveryImageByOrderId(
    orderId: number,
  ): Promise<FailDeliveryImageDto>;
}

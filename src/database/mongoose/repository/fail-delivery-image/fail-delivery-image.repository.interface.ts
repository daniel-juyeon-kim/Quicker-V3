import { FailDeliveryImage } from '../../models';

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

  findFailDeliveryImageByOrderId(orderId: number): Promise<FailDeliveryImage>;
}

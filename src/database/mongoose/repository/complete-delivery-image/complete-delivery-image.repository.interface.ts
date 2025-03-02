import { OrderCompleteImageDto } from '@src/router/order-image/dto/order-complete-image.dto';

export interface ICompleteDeliveryImageRepository {
  create({
    orderId,
    bufferImage,
  }: {
    orderId: number;
    bufferImage: Buffer;
  }): Promise<void>;

  findCompleteImageBufferByOrderId(
    orderId: number,
  ): Promise<OrderCompleteImageDto>;
}

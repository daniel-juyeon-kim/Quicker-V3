import { FindCompleteDeliveryImageDto } from '@src/router/order-image/dto/find-complete-image.dto';

export interface ICompleteDeliveryImageRepository {
  create({ orderId, image }: { orderId: number; image: Buffer }): Promise<void>;

  findCompleteImageBufferByOrderId(
    orderId: number,
  ): Promise<FindCompleteDeliveryImageDto>;
}

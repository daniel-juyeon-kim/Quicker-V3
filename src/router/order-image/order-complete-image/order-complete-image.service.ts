import { Inject, Injectable } from '@nestjs/common';
import { RepositoryToken } from '@src/core/constant';
import { ICompleteDeliveryImageRepository } from '@src/database/mongoose/repository/complete-delivery-image/complete-delivery-image.repository.interface';
import { IOrderCompleteImageService } from './order-complete-image.service.interface';

@Injectable()
export class OrderCompleteImageService implements IOrderCompleteImageService {
  constructor(
    @Inject(RepositoryToken.COMPLETE_DELIVERY_IMAGE_REPOSITORY)
    private readonly repository: ICompleteDeliveryImageRepository,
  ) {}

  async findCompleteImageBuffer(orderId: number) {
    const buffer =
      await this.repository.findCompleteImageBufferByOrderId(orderId);
    return { buffer };
  }

  async createCompleteImageBuffer({
    orderId,
    buffer,
  }: {
    orderId: number;
    buffer: Buffer;
  }) {
    await this.repository.create({ orderId, bufferImage: buffer });
  }
}

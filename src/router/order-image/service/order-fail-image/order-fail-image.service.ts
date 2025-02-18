import { Inject, Injectable } from '@nestjs/common';
import { RepositoryToken } from '@src/core/constant';
import { IFailDeliveryImageRepository } from '@src/database/mongoose/repository/fail-delivery-image/fail-delivery-image.repository.interface';
import { IOrderFailImageService } from './order-fail-image.service.interface';

@Injectable()
export class OrderFailImageService implements IOrderFailImageService {
  constructor(
    @Inject(RepositoryToken.FAIL_DELIVERY_IMAGE_REPOSITORY)
    private readonly failDeliveryImageRepository: IFailDeliveryImageRepository,
  ) {}

  async findOrderFailImageByOrderId(orderId: number) {
    return await this.failDeliveryImageRepository.findFailDeliveryImageByOrderId(
      orderId,
    );
  }

  async createFailImage({
    orderId,
    reason,
    file,
  }: {
    orderId: number;
    reason: string;
    file: Express.Multer.File;
  }) {
    await this.failDeliveryImageRepository.createFailDeliveryImage({
      orderId,
      reason,
      bufferImage: file.buffer,
    });
  }
}

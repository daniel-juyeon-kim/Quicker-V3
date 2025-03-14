import { Test, TestingModule } from '@nestjs/testing';
import { RepositoryToken } from '@src/core/constant';
import {
  DuplicatedDataException,
  NotExistDataException,
} from '@src/core/exception';
import { IFailDeliveryImageRepository } from '@src/database/mongoose/repository/fail-delivery-image/fail-delivery-image.repository.interface';
import { mock, mockClear } from 'jest-mock-extended';
import { Readable } from 'stream';
import { FailDeliveryImageDto } from '../../dto/order-fail-image.dto';
import { OrderFailImageService } from './order-fail-image.service';

describe('OrderFailImageService', () => {
  let service: OrderFailImageService;

  const repository = mock<IFailDeliveryImageRepository>();
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrderFailImageService,
        {
          provide: RepositoryToken.FAIL_DELIVERY_IMAGE_REPOSITORY,
          useValue: repository,
        },
      ],
    }).compile();

    service = module.get<OrderFailImageService>(OrderFailImageService);
    mockClear(repository);
  });

  describe('createFailImage', () => {
    test('통과하는 테스트', async () => {
      const file = {
        fieldname: 'uploadedFile',
        originalname: 'example.png',
        encoding: '7bit',
        mimetype: 'image/png',
        size: 1024,
        stream: new Readable(),
        destination: '/uploads',
        filename: 'example-1234.png',
        path: '/uploads/example-1234.png',
        buffer: Buffer.from('file content'),
      };
      const orderId = 1;
      const reason = '이유';

      await service.createFailImage({ file, orderId, reason });

      expect(repository.createFailDeliveryImage).toHaveBeenCalledWith({
        orderId,
        reason,
        bufferImage: file.buffer,
      });
    });

    test('실패하는 테스트, DuplicatedDataError를 던짐', async () => {
      const orderId = 1;
      const file = {
        fieldname: 'uploadedFile',
        originalname: 'example.png',
        encoding: '7bit',
        mimetype: 'image/png',
        size: 1024,
        stream: new Readable(),
        destination: '/uploads',
        filename: 'example-1234.png',
        path: '/uploads/example-1234.png',
        buffer: Buffer.from('file content'),
      };
      const reason = '이유';
      const error = new DuplicatedDataException(orderId);
      repository.createFailDeliveryImage.mockRejectedValueOnce(error);

      await expect(
        service.createFailImage({ file, orderId, reason }),
      ).rejects.toStrictEqual(error);
    });
  });

  describe('findOrderFailImageByOrderId', () => {
    test('통과하는 테스트', async () => {
      const orderId = 1;
      const resolvedValue: FailDeliveryImageDto = {
        reason: '이유',
        image: { data: Buffer.from('file content'), type: 'Buffer' },
      };
      repository.findFailDeliveryImageByOrderId.mockResolvedValueOnce(
        resolvedValue,
      );

      await expect(
        service.findOrderFailImageByOrderId(orderId),
      ).resolves.toStrictEqual(resolvedValue);

      expect(repository.findFailDeliveryImageByOrderId).toHaveBeenCalledWith(
        orderId,
      );
    });

    test('실패하는 테스트, NotExistDataError를 던짐', async () => {
      const orderId = 1;
      const error = new NotExistDataException(orderId);
      repository.findFailDeliveryImageByOrderId.mockRejectedValueOnce(error);

      await expect(
        service.findOrderFailImageByOrderId(orderId),
      ).rejects.toStrictEqual(error);
    });
  });
});

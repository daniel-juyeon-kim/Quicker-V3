import { Test, TestingModule } from '@nestjs/testing';
import { RepositoryToken } from '@src/core/constant';
import { DuplicatedDataError, NotExistDataError } from '@src/database';
import { ICompleteDeliveryImageRepository } from '@src/database/mongoose/repository/complete-delivery-image/complete-delivery-image.repository.interface';
import { Buffer } from 'buffer';
import { mock, mockClear } from 'jest-mock-extended';
import { Readable } from 'stream';
import { OrderCompleteImageService } from './order-complete-image.service';

describe('OrderCompleteImageService', () => {
  let service: OrderCompleteImageService;

  const repository = mock<ICompleteDeliveryImageRepository>();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrderCompleteImageService,
        {
          provide: RepositoryToken.COMPLETE_DELIVERY_IMAGE_REPOSITORY,
          useValue: repository,
        },
      ],
    }).compile();

    service = module.get<OrderCompleteImageService>(OrderCompleteImageService);
    mockClear(repository);
  });

  describe('createFailImage()', () => {
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

      await service.createCompleteImageBuffer({ buffer: file.buffer, orderId });

      expect(repository.create).toHaveBeenCalledWith({
        orderId,
        bufferImage: file.buffer,
      });
    });

    test('실패하는 테스트', async () => {
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
      const error = new DuplicatedDataError(
        `${orderId}에 해당되는 데이터가 이미 존재합니다.`,
      );

      repository.create.mockRejectedValueOnce(error);

      await expect(
        service.createCompleteImageBuffer({ orderId, buffer: file.buffer }),
      ).rejects.toStrictEqual(error);
    });
  });

  describe('findCompleteImageBuffer()', () => {
    test('통과하는 테스트', async () => {
      const orderId = 1;
      const resolvedValue = Buffer.from('file content');

      repository.findCompleteImageBufferByOrderId.mockResolvedValueOnce(
        resolvedValue,
      );

      await expect(
        service.findCompleteImageBuffer(orderId),
      ).resolves.toStrictEqual({ buffer: resolvedValue });
    });

    test('실패하는 테스트', async () => {
      const orderId = 1;
      const error = new NotExistDataError(
        `${orderId}에 해당되는 이미지 버퍼가 존재하지 않습니다.`,
      );

      repository.findCompleteImageBufferByOrderId.mockRejectedValueOnce(error);

      await expect(
        service.findCompleteImageBuffer(orderId),
      ).rejects.toStrictEqual(error);
    });
  });
});

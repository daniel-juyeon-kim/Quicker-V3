import { Test, TestingModule } from '@nestjs/testing';
import { RepositoryToken } from '@src/core/constant';
import {
  DuplicatedDataException,
  NotExistDataException,
} from '@src/core/exception';
import { ICompleteDeliveryImageRepository } from '@src/database/mongoose/repository/complete-delivery-image/complete-delivery-image.repository.interface';
import { Buffer } from 'buffer';
import { plainToInstance } from 'class-transformer';
import { mock, mockClear } from 'jest-mock-extended';
import { Readable } from 'stream';
import { FindCompleteDeliveryImageDto } from '../../dto/find-complete-image.dto';
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

  describe('createCompleteImageBuffer', () => {
    test('통과하는 테스트', async () => {
      const imageFile = {
        fieldname: 'uploadedFile',
        originalname: 'example.png',
        encoding: '7bit',
        mimetype: 'image/png',
        size: 1024,
        stream: new Readable(),
        destination: '/uploads',
        filename: 'example-1234.png',
        path: '/uploads/example-1234.png',
        image: Buffer.from('file content'),
      };
      const orderId = 1;

      await service.createCompleteImageBuffer({
        image: imageFile.image,
        orderId,
      });

      expect(repository.create).toHaveBeenCalledWith({
        orderId,
        image: imageFile.image,
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
        image: Buffer.from('file content'),
      };
      const orderId = 1;
      const error = new DuplicatedDataException(orderId);

      repository.create.mockRejectedValueOnce(error);

      await expect(
        service.createCompleteImageBuffer({ orderId, image: file.image }),
      ).rejects.toStrictEqual(error);
    });
  });

  describe('findCompleteImageBufferByOrderId', () => {
    test('통과하는 테스트', async () => {
      const orderId = 1;
      const resolvedValue = plainToInstance(
        FindCompleteDeliveryImageDto,
        Buffer.from('file content'),
        { excludeExtraneousValues: true },
      );

      repository.findCompleteImageBufferByOrderId.mockResolvedValueOnce(
        resolvedValue,
      );

      await expect(
        service.findCompleteImageBufferByOrderId(orderId),
      ).resolves.toStrictEqual(resolvedValue);
    });

    test('실패하는 테스트', async () => {
      const orderId = 1;
      const error = new NotExistDataException(orderId);

      repository.findCompleteImageBufferByOrderId.mockRejectedValueOnce(error);

      await expect(
        service.findCompleteImageBufferByOrderId(orderId),
      ).rejects.toStrictEqual(error);
    });
  });
});

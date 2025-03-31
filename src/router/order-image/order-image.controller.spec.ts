import { Test, TestingModule } from '@nestjs/testing';
import { ServiceToken } from '@src/core/constant';
import {
  DuplicatedDataException,
  NotExistDataException,
} from '@src/core/exception';
import { mock } from 'jest-mock-extended';
import { Readable } from 'stream';
import { FindCompleteDeliveryImageDto } from './dto/find-complete-image.dto';
import { FindFailDeliveryImageDto } from './dto/find-fail-image.dto';
import { OrderImageController } from './order-image.controller';
import { IOrderCompleteImageService } from './service/order-complete-image/order-complete-image.service.interface';
import { IOrderFailImageService } from './service/order-fail-image/order-fail-image.service.interface';

describe('OrderImageController', () => {
  let controller: OrderImageController;

  const orderFailImageService = mock<IOrderFailImageService>();
  const orderCompleteImageService = mock<IOrderCompleteImageService>();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrderImageController],
      providers: [
        {
          provide: ServiceToken.ORDER_FAIL_IMAGE_SERVICE,
          useValue: orderFailImageService,
        },
        {
          provide: ServiceToken.ORDER_COMPLETE_IMAGE_SERVICE,
          useValue: orderCompleteImageService,
        },
      ],
    }).compile();

    controller = module.get<OrderImageController>(OrderImageController);
  });

  describe('findFailImage', () => {
    test('통과하는 테스트', async () => {
      const orderId = 1;
      const resolvedValue: FindFailDeliveryImageDto = {
        image: Buffer.from([102, 97, 107, 101, 66, 117]),
        reason: '이유',
      };
      orderFailImageService.findOrderFailImageByOrderId.mockResolvedValueOnce(
        resolvedValue,
      );

      await expect(controller.findFailImage(orderId)).resolves.toStrictEqual(
        resolvedValue,
      );

      expect(
        orderFailImageService.findOrderFailImageByOrderId,
      ).toHaveBeenCalledWith(orderId);
    });

    test('실패하는 테스트, 존재하지 않는 데이터 접근', async () => {
      const orderId = 1;
      const error = new NotExistDataException(orderId);
      orderFailImageService.findOrderFailImageByOrderId.mockRejectedValueOnce(
        error,
      );

      await expect(controller.findFailImage(orderId)).rejects.toStrictEqual(
        error,
      );
    });
  });

  describe('postFailImage', () => {
    const imageFile = {
      image: Buffer.from('file content'),
    };
    const orderId = 1;
    const reason = '이유';

    test('통과하는 테스트', async () => {
      await controller.createFailDeliveryImage(imageFile, orderId, reason);

      expect(orderFailImageService.createFailImage).toHaveBeenCalledWith({
        image: imageFile.image,
        orderId,
        reason,
      });
    });

    test('실패하는 테스트, 중복되는 데이터', async () => {
      const error = new DuplicatedDataException(orderId);
      orderFailImageService.createFailImage.mockRejectedValueOnce(error);

      await expect(
        controller.createFailDeliveryImage(imageFile, orderId, reason),
      ).rejects.toStrictEqual(error);
    });
  });

  describe('findCompleteImageBuffer', () => {
    test('통과하는 테스트', async () => {
      const orderId = 1;
      const buffer = Buffer.from([102, 97, 107, 101, 66, 117]);

      const dto = new FindCompleteDeliveryImageDto();
      dto.image = buffer;

      orderCompleteImageService.findCompleteImageBufferByOrderId.mockResolvedValueOnce(
        dto,
      );

      await expect(
        controller.findCompleteImageBuffer(orderId),
      ).resolves.toStrictEqual(dto);

      expect(
        orderCompleteImageService.findCompleteImageBufferByOrderId,
      ).toHaveBeenCalledWith(orderId);
    });

    test('실패하는 테스트, 존재하지 않는 데이터 접근', async () => {
      const orderId = 1;
      const error = new NotExistDataException(orderId);

      orderCompleteImageService.findCompleteImageBufferByOrderId.mockRejectedValueOnce(
        error,
      );

      await expect(
        controller.findCompleteImageBuffer(orderId),
      ).rejects.toStrictEqual(error);
    });
  });

  describe('postCompleteImageBuffer', () => {
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

    test('통과하는 테스트', async () => {
      const dto = { orderId: 1 };

      await controller.postCompleteImageBuffer(imageFile, dto.orderId);

      expect(
        orderCompleteImageService.createCompleteImageBuffer,
      ).toHaveBeenCalledWith({
        orderId: dto.orderId,
        image: imageFile.image,
      });
    });

    test('실패하는 테스트, 중복 데이터 저장', async () => {
      const dto = { orderId: 1 };
      const error = new DuplicatedDataException(1);

      orderCompleteImageService.createCompleteImageBuffer.mockRejectedValueOnce(
        error,
      );

      await expect(
        controller.postCompleteImageBuffer(imageFile, dto.orderId),
      ).rejects.toStrictEqual(error);
    });
  });
});

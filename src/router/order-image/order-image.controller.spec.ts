import { Test, TestingModule } from '@nestjs/testing';
import { ServiceToken } from '@src/core/constant';
import { DuplicatedDataException, NotExistDataException } from '@src/database';
import { mock } from 'jest-mock-extended';
import { Readable } from 'stream';
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
      const resolvedValue = {
        _id: 1,
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
      const error = new NotExistDataException('존재하지 않는 데이터');
      orderFailImageService.findOrderFailImageByOrderId.mockRejectedValueOnce(
        error,
      );

      await expect(controller.findFailImage(orderId)).rejects.toStrictEqual(
        error,
      );
    });
  });

  describe('postFailImage', () => {
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

    test('통과하는 테스트', async () => {
      const dto = {
        orderId,
        reason,
      };

      await controller.postFailImage(file, dto);

      expect(orderFailImageService.createFailImage).toHaveBeenCalledWith({
        file,
        orderId,
        reason,
      });
    });

    test('실패하는 테스트, 중복되는 데이터', async () => {
      const dto = {
        orderId,
        reason,
      };
      const error = new DuplicatedDataException('데이터 중복');
      orderFailImageService.createFailImage.mockRejectedValueOnce(error);

      await expect(controller.postFailImage(file, dto)).rejects.toStrictEqual(
        error,
      );
    });
  });

  describe('findCompleteImageBuffer', () => {
    test('통과하는 테스트', async () => {
      const orderId = 1;
      const buffer = Buffer.from([102, 97, 107, 101, 66, 117]);

      orderCompleteImageService.findCompleteImageBufferByOrderId.mockResolvedValueOnce(
        {
          buffer,
        },
      );

      await expect(
        controller.findCompleteImageBuffer(orderId),
      ).resolves.toStrictEqual({ buffer });

      expect(
        orderCompleteImageService.findCompleteImageBufferByOrderId,
      ).toHaveBeenCalledWith(orderId);
    });

    test('실패하는 테스트, 존재하지 않는 데이터 접근', async () => {
      const orderId = 1;
      const error = new NotExistDataException('존재하지 않는 데이터');

      orderCompleteImageService.findCompleteImageBufferByOrderId.mockRejectedValueOnce(
        error,
      );

      await expect(
        controller.findCompleteImageBuffer(orderId),
      ).rejects.toStrictEqual(error);
    });
  });

  describe('postCompleteImageBuffer', () => {
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

    test('통과하는 테스트', async () => {
      const dto = { orderId: 1 };

      await controller.postCompleteImageBuffer(file, dto);

      expect(
        orderCompleteImageService.createCompleteImageBuffer,
      ).toHaveBeenCalledWith({
        orderId: dto.orderId,
        buffer: file.buffer,
      });
    });

    test('실패하는 테스트, 중복 데이터 저장', async () => {
      const dto = { orderId: 1 };
      const error = new DuplicatedDataException('중복 데이터');

      orderCompleteImageService.createCompleteImageBuffer.mockRejectedValueOnce(
        error,
      );

      await expect(
        controller.postCompleteImageBuffer(file, dto),
      ).rejects.toStrictEqual(error);
    });
  });
});

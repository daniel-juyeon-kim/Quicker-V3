import { Test } from '@nestjs/testing';
import { ServiceToken } from '@src/core/constant';
import { NotExistDataException } from '@src/database';
import { mock, mockClear } from 'jest-mock-extended';
import { OrderSenderReceiverController } from './order-sender-receiver.controller';
import { IOrderSenderReceiverService } from './order-sender-receiver.service.interface';

describe('OrderSenderReceiverController', () => {
  let controller: OrderSenderReceiverController;

  const service = mock<IOrderSenderReceiverService>();
  beforeEach(async () => {
    const module = await Test.createTestingModule({
      controllers: [OrderSenderReceiverController],
      providers: [
        {
          provide: ServiceToken.ORDER_SENDER_RECEIVER_SERVICE,
          useValue: service,
        },
      ],
    }).compile();

    controller = module.get(OrderSenderReceiverController);
    mockClear(service);
  });

  describe('findSenderReceiverLocationAndPhoneNumber', () => {
    test('통과하는 테스트', async () => {
      const orderId = 1;
      const resolveValue = {
        id: orderId,
        departure: {
          id: 101,
          x: 127.123456,
          y: 37.123456,
          sender: {
            phone: '010-1234-5678',
          },
        },
        destination: {
          id: 102,
          x: 126.987654,
          y: 36.987654,
          receiver: {
            phone: '010-8765-4321',
          },
        },
      };
      service.findSenderReceiverLocationAndPhoneNumberByOrderId.mockResolvedValueOnce(
        resolveValue,
      );

      await expect(
        controller.findSenderReceiverLocationAndPhoneNumber(orderId),
      ).resolves.toStrictEqual(resolveValue);

      expect(
        service.findSenderReceiverLocationAndPhoneNumberByOrderId,
      ).toHaveBeenCalledWith(orderId);
    });

    test('실패하는 테스트, NotExistDataException 던짐', async () => {
      const orderId = 1;
      const error = new NotExistDataException(
        `${orderId}에 해당되는 데이터가 존재하지 않습니다.`,
      );
      service.findSenderReceiverLocationAndPhoneNumberByOrderId.mockRejectedValueOnce(
        error,
      );

      await expect(
        controller.findSenderReceiverLocationAndPhoneNumber(orderId),
      ).rejects.toStrictEqual(error);

      expect(
        service.findSenderReceiverLocationAndPhoneNumberByOrderId,
      ).toHaveBeenCalledWith(orderId);
    });
  });
});

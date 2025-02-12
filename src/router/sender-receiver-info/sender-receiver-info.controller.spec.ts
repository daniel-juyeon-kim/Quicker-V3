import { Test, TestingModule } from '@nestjs/testing';
import { ServiceToken } from '@src/core/constant';
import { NotExistDataError } from '@src/database';
import { mock, mockClear } from 'jest-mock-extended';
import { SenderReceiverInfoController } from './sender-receiver-info.controller';
import { ISenderReceiverInfoService } from './sender-receiver-info.service.interface';

describe('SenderReceiverInfoController', () => {
  let controller: SenderReceiverInfoController;

  const service = mock<ISenderReceiverInfoService>();
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SenderReceiverInfoController],
      providers: [
        {
          provide: ServiceToken.SENDER_RECEIVER_INFO_SERVICE,
          useValue: service,
        },
      ],
    }).compile();

    controller = module.get<SenderReceiverInfoController>(
      SenderReceiverInfoController,
    );
    mockClear(service);
  });

  describe('getSenderReceiverInfo()', () => {
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
      service.findSenderReceiverInfo.mockResolvedValueOnce(resolveValue);

      await expect(
        controller.getSenderReceiverInfo(orderId),
      ).resolves.toStrictEqual(resolveValue);

      expect(service.findSenderReceiverInfo).toHaveBeenCalledWith(orderId);
    });

    test('실패하는 테스트, NotExistDataError를 던짐', async () => {
      const orderId = 1;
      const error = new NotExistDataError(
        `${orderId}에 해당되는 데이터가 존재하지 않습니다.`,
      );
      service.findSenderReceiverInfo.mockRejectedValueOnce(error);

      await expect(
        controller.getSenderReceiverInfo(orderId),
      ).rejects.toStrictEqual(error);

      expect(service.findSenderReceiverInfo).toHaveBeenCalledWith(orderId);
    });
  });
});

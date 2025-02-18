import { Test, TestingModule } from '@nestjs/testing';
import { RepositoryToken } from '@src/core/constant';
import { NotExistDataException } from '@src/database';
import { IOrderParticipantRepository } from '@src/database/type-orm/repository/order-participant/order-participant.repository.interface';
import { mock } from 'jest-mock-extended';
import { OrderSenderReceiverService } from './order-sender-receiver.service';

describe('OrderSenderReceiverService', () => {
  let service: OrderSenderReceiverService;

  const repository = mock<IOrderParticipantRepository>();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrderSenderReceiverService,
        {
          provide: RepositoryToken.ORDER_PARTICIPANT_REPOSITORY,
          useValue: repository,
        },
      ],
    }).compile();

    service = module.get(OrderSenderReceiverService);
  });

  describe('findSenderReceiverLocationAndPhoneNumberByOrderId', () => {
    test('통과하는 테스트', async () => {
      const orderId = 1;
      const resolvedValue = {
        id: orderId,
        departure: {
          id: orderId,
          x: 126.977,
          y: 37.5665,

          sender: { phone: '01012341234' },
        },
        destination: {
          id: orderId,
          x: 129.0756,
          y: 35.1796,
          receiver: { phone: '01046231234' },
        },
      };
      repository.findSenderReceiverLocationAndPhoneNumberByOrderId.mockResolvedValueOnce(
        resolvedValue,
      );

      await expect(
        service.findSenderReceiverLocationAndPhoneNumberByOrderId(orderId),
      ).resolves.toStrictEqual(resolvedValue);

      expect(
        repository.findSenderReceiverLocationAndPhoneNumberByOrderId,
      ).toHaveBeenCalledWith(orderId);
    });

    test('실패하는 테스트, NotExistDataException 던짐', async () => {
      const orderId = 1;
      const error = new NotExistDataException(
        `${orderId}에 해당되는 데이터가 존재하지 않습니다.`,
      );

      repository.findSenderReceiverLocationAndPhoneNumberByOrderId.mockRejectedValueOnce(
        error,
      );

      await expect(
        service.findSenderReceiverLocationAndPhoneNumberByOrderId(orderId),
      ).rejects.toStrictEqual(error);
    });
  });
});

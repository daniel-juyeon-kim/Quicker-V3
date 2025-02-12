import { Test, TestingModule } from '@nestjs/testing';
import { RepositoryToken } from '@src/core/constant';
import { NotExistDataError } from '@src/database';
import { IOrderParticipantRepository } from '@src/database/type-orm/repository/order-participant/order-participant.repository.interface';
import { mock } from 'jest-mock-extended';
import { SenderReceiverInfoService } from './sender-receiver-info.service';

describe('SenderReceiverInfoService', () => {
  let service: SenderReceiverInfoService;

  const repository = mock<IOrderParticipantRepository>();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SenderReceiverInfoService,
        {
          provide: RepositoryToken.ORDER_PARTICIPANT_REPOSITORY,
          useValue: repository,
        },
      ],
    }).compile();

    service = module.get<SenderReceiverInfoService>(SenderReceiverInfoService);
  });

  describe('findSenderReceiverInfo()', () => {
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
      repository.findSenderReceiverInfoByOrderId.mockResolvedValueOnce(
        resolvedValue,
      );

      await expect(
        service.findSenderReceiverInfo(orderId),
      ).resolves.toStrictEqual(resolvedValue);

      expect(repository.findSenderReceiverInfoByOrderId).toHaveBeenCalledWith(
        orderId,
      );
    });

    test('실패하는 테스트', async () => {
      const orderId = 1;
      const error = new NotExistDataError(
        `${orderId}에 해당되는 데이터가 존재하지 않습니다.`,
      );

      repository.findSenderReceiverInfoByOrderId.mockRejectedValueOnce(error);

      await expect(
        service.findSenderReceiverInfo(orderId),
      ).rejects.toStrictEqual(error);
    });
  });
});

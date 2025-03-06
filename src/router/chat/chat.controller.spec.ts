import { Test, TestingModule } from '@nestjs/testing';
import { ServiceToken } from '@src/core/constant';
import { NotExistDataException } from '@src/core/exception';
import { mock } from 'jest-mock-extended';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';

describe('ChatController', () => {
  const service = mock<ChatService>();
  let controller: ChatController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ChatController],
      providers: [{ provide: ServiceToken.CHAT_SERVICE, useValue: service }],
    }).compile();

    controller = module.get<ChatController>(ChatController);
  });

  describe('findRecentMessageByOrderId', () => {
    test('통과하는 테스트', async () => {
      const date = new Date(2000, 1, 1);
      const orderId = 1;
      const result = {
        date,
        walletAddress: '지갑주소',
        message: 'message',
      };

      service.findRecentMessageByOrderId.mockResolvedValueOnce(result);

      await expect(
        controller.findRecentMessage(orderId),
      ).resolves.toStrictEqual(result);
      expect(service.findRecentMessageByOrderId).toHaveBeenCalledWith(orderId);
    });

    test('실패하는 테스트, 데이터베이스에 해당 데이터가 없음 NotExistDataError를 던짐', async () => {
      const orderId = 1;
      const error = new NotExistDataException('orderId', orderId);

      service.findRecentMessageByOrderId.mockRejectedValueOnce(error);

      await expect(controller.findRecentMessage(orderId)).rejects.toStrictEqual(
        error,
      );
    });
  });
});

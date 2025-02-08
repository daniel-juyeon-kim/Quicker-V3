import { Test, TestingModule } from '@nestjs/testing';
import { ServiceToken } from '@src/core/constant';
import { NotExistDataError } from '@src/database';
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

  describe('getRecentMessage()', () => {
    const date = new Date(2000, 1, 1);

    test('통과하는 테스트', async () => {
      const orderId = 1;
      const result = {
        date,
        walletAddress: '지갑주소',
        message: 'message',
      };

      service.findRecentMessage.mockResolvedValueOnce(result);

      await expect(controller.getRecentMessage(orderId)).resolves.toStrictEqual(
        result,
      );
      expect(service.findRecentMessage).toHaveBeenCalled();
    });

    test('실패하는 테스트, 데이터가 존재하지 않음', async () => {
      const orderId = 1;
      const error = new NotExistDataError('데이터가 존재하지 않습니다.');

      service.findRecentMessage.mockRejectedValueOnce(error);

      await expect(controller.getRecentMessage(orderId)).rejects.toStrictEqual(
        error,
      );
      expect(service.findRecentMessage).toHaveBeenCalled();
    });
  });
});

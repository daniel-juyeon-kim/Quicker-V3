import { Test, TestingModule } from '@nestjs/testing';
import { ChatMessageRepository } from '@src/database/mongoose/repository/chat-message/chat-message.repository';
import { mock, mockClear } from 'jest-mock-extended';
import { ChatService } from './chat.service';
import { RepositoryToken } from '@src/core/constant';

describe('ChatService', () => {
  let service: ChatService;
  const repository = mock<ChatMessageRepository>();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChatService,
        {
          provide: RepositoryToken.CHAT_MESSAGE_REPOSITORY,
          useValue: repository,
        },
      ],
    }).compile();

    service = module.get<ChatService>(ChatService);

    mockClear(repository);
  });

  describe('findRecentMessage()', () => {
    test('통과하는 테스트', async () => {
      const orderId = 1;

      await service.findRecentMessage(orderId);

      expect(repository.findRecentMessageByOrderId).toHaveBeenCalledWith(
        orderId,
      );
    });
  });
});

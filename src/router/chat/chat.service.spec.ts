import { Test, TestingModule } from '@nestjs/testing';
import { RepositoryToken } from '@src/core/constant';
import { NotExistDataException } from '@src/core/exception';
import { IChatMessageRepository } from '@src/database/mongoose/repository/chat-message/chat-message.repository.interface';
import { plainToInstance } from 'class-transformer';
import { mock, mockClear } from 'jest-mock-extended';
import { ChatService } from './chat.service';
import { ChatMessageDto } from './dto/chat-message.dto';

describe('ChatService', () => {
  let service: ChatService;
  const repository = mock<IChatMessageRepository>();

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

  describe('findRecentMessageByOrderId', () => {
    test('통과하는 테스트', async () => {
      const orderId = 1;
      const resolvedValue = plainToInstance(ChatMessageDto, {
        walletAddress: '지갑 주소 1',
        message: '메세지3',
        date: new Date(2000, 1, 1),
      });
      repository.findRecentMessageByOrderId.mockResolvedValueOnce(
        resolvedValue,
      );

      await expect(
        service.findRecentMessageByOrderId(orderId),
      ).resolves.toStrictEqual(resolvedValue);

      expect(repository.findRecentMessageByOrderId).toHaveBeenCalledWith(
        orderId,
      );
    });

    test('실패하는 테스트, orderId에 해당되는 데이터가 존재하지 않으면 NotExistDataError를 던짐', async () => {
      const orderId = 1;
      const error = new NotExistDataException('orderId', orderId);
      repository.findRecentMessageByOrderId.mockRejectedValueOnce(error);

      await expect(
        service.findRecentMessageByOrderId(orderId),
      ).rejects.toStrictEqual(error);
    });
  });
});

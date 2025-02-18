import { getModelToken, MongooseModule } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Model } from 'mongoose';
import {
  ChatMessages,
  ChatMessageSchema,
  NotExistDataException,
} from '../../..';
import { ChatMessageRepository } from './chat-message.repository';

describe('ChatMessageRepository 테스트', () => {
  let mongod: MongoMemoryServer;
  let model: Model<ChatMessages>;
  let repository: ChatMessageRepository;
  let testModule: TestingModule;

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    const url = mongod.getUri();

    testModule = await Test.createTestingModule({
      imports: [
        MongooseModule.forRoot(url),
        MongooseModule.forFeature([
          { name: ChatMessages.name, schema: ChatMessageSchema },
        ]),
      ],
      providers: [ChatMessageRepository],
    }).compile();

    model = testModule.get(getModelToken(ChatMessages.name));
    repository = testModule.get(ChatMessageRepository);
  });

  afterAll(async () => {
    await testModule.close();
  });

  const CREATED_DATE = new Date(2000, 1, 1);
  const messages = [
    {
      walletAddress: '지갑 주소 1',
      message: '메세지1',
      date: CREATED_DATE,
    },
    {
      walletAddress: '지갑 주소 2',
      message: '메세지2',
      date: CREATED_DATE,
    },
    {
      walletAddress: '지갑 주소 1',
      message: '메세지3',
      date: CREATED_DATE,
    },
  ];

  describe('find', () => {
    beforeEach(async () => {
      const chatMessage = new model({
        id: 1,
        messages,
      });
      await chatMessage.save();
    });

    afterEach(async () => {
      await model.deleteMany();
    });

    const ORDER_ID = 1;
    const NOT_EXIST_ORDER_ID = 66;
    const CREATED_DATE = new Date(2000, 1, 1);

    describe('findAllMessageByOrderId', () => {
      test('통과하는 테스트', async () => {
        const result = {
          messages: [
            {
              walletAddress: '지갑 주소 1',
              message: '메세지1',
              date: CREATED_DATE,
            },
            {
              walletAddress: '지갑 주소 2',
              message: '메세지2',
              date: CREATED_DATE,
            },
            {
              walletAddress: '지갑 주소 1',
              message: '메세지3',
              date: CREATED_DATE,
            },
          ],
        };

        await expect(
          repository.findAllMessageByOrderId(ORDER_ID),
        ).resolves.toEqual(result);
      });

      test('실패하는 테스트, DB에 데이터가 없으면 NotExistDataError를 던짐', async () => {
        const error = new NotExistDataException('데이터가 존재하지 않습니다.');

        await expect(
          repository.findAllMessageByOrderId(NOT_EXIST_ORDER_ID),
        ).rejects.toStrictEqual(error);
      });
    });

    describe('findRecentMessageByOrderId', () => {
      test('통과하는 테스트', async () => {
        const result = {
          walletAddress: '지갑 주소 1',
          message: '메세지3',
          date: CREATED_DATE,
        };

        await expect(
          repository.findRecentMessageByOrderId(ORDER_ID),
        ).resolves.toStrictEqual(result);
      });

      test('실패하는 테스트, DB에 데이터가 없으면 NotExistDataError를 던짐', async () => {
        const error = new NotExistDataException(
          `${NOT_EXIST_ORDER_ID}에 대한 데이터가 존재하지 않습니다.`,
        );

        await expect(
          repository.findRecentMessageByOrderId(NOT_EXIST_ORDER_ID),
        ).rejects.toStrictEqual(error);
      });
    });
  });

  describe('saveMessage 테스트', () => {
    const ORDER_ID = 1;
    const walletAddress = '지갑 주소 4';

    afterEach(async () => {
      await model.deleteMany();
    });

    test('통과하는 테스트, 채팅방이 생성되지 않았으면 생성후 메시지를 저장', async () => {
      const date = new Date(2000, 1, 1);
      const message = '메시지1';
      const result = {
        id: ORDER_ID,
        messages: [
          {
            date,
            message,
            walletAddress,
          },
        ],
      };

      await repository.saveMessage(ORDER_ID, {
        walletAddress,
        message,
        date,
      });

      await expect(
        model
          .findOne({ id: ORDER_ID })
          .select(['-__v', '-_id', '-messages._id'])
          .lean(),
      ).resolves.toStrictEqual(result);
    });

    test('통과하는 테스트, 여러개의 메시지 저장', async () => {
      const date = new Date(1999, 1, 1);
      const result = {
        id: ORDER_ID,
        messages: [
          { walletAddress, date, message: '메시지1' },
          { walletAddress, date, message: '메시지2' },
        ],
      };

      await repository.saveMessage(ORDER_ID, {
        walletAddress,
        message: '메시지1',
        date,
      });
      await repository.saveMessage(ORDER_ID, {
        walletAddress,
        message: '메시지2',
        date,
      });

      await expect(
        model
          .findOne({ id: ORDER_ID })
          .select(['-__v', '-_id', '-messages._id'])
          .lean(),
      ).resolves.toStrictEqual(result);
    });
  });
});

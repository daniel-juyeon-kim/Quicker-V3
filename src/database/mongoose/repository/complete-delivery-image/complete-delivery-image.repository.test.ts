import { MongooseModule, getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { DuplicatedDataError, NotExistDataError } from '@src/database/type-orm';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Model } from 'mongoose';
import {
  ChatMessage,
  CompleteDeliveryImage,
  CompleteDeliveryImageSchema,
} from '../../models';
import { CompleteDeliveryImageRepository } from './complete-delivery-image.repository';

describe('CompleteDeliveryImageRepository', () => {
  let mongod: MongoMemoryServer;
  let model: Model<ChatMessage>;
  let repository: CompleteDeliveryImageRepository;
  let testModule: TestingModule;

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    const url = mongod.getUri();

    testModule = await Test.createTestingModule({
      imports: [
        MongooseModule.forRoot(url),
        MongooseModule.forFeature([
          {
            name: CompleteDeliveryImage.name,
            schema: CompleteDeliveryImageSchema,
          },
        ]),
      ],
      providers: [CompleteDeliveryImageRepository],
    }).compile();

    model = testModule.get(getModelToken(CompleteDeliveryImage.name));
    repository = testModule.get(CompleteDeliveryImageRepository);
  });

  afterAll(async () => {
    await testModule.close();
  });

  describe('findByOrderId 테스트', () => {
    beforeEach(async () => {
      const image = await model.create({
        _id: 1,
        bufferImage: Buffer.from('1'),
      });

      await image.save();
    });

    afterEach(async () => {
      await model.deleteMany();
    });

    test('통과하는 테스트', async () => {
      const orderId = 1;
      const result = {
        data: [49],
        type: 'Buffer',
      };

      await expect(
        repository.findCompleteImageBufferByOrderId(orderId),
      ).resolves.toEqual(result);
    });

    test('실패하는 테스트, 존재하지 않는 값 입력', async () => {
      const orderId = 3;
      const error = new NotExistDataError(
        `${orderId}에 해당되는 이미지 버퍼가 존재하지 않습니다.`,
      );

      await expect(
        repository.findCompleteImageBufferByOrderId(orderId),
      ).rejects.toStrictEqual(error);
    });
  });

  describe('create 테스트', () => {
    afterEach(async () => {
      await model.deleteMany();
    });

    test('통과하는 테스트', async () => {
      const orderId = 1;
      const result = {
        __v: 0,
        _id: 1,
        bufferImage: { data: [49], type: 'Buffer' },
      };

      await repository.create({ orderId, bufferImage: Buffer.from('1') });

      expect((await model.findById(orderId)).toJSON()).toEqual(result);
    });

    describe('실패하는 테스트', () => {
      test('중복된 데이터', async () => {
        const orderId = 1;
        const error = new DuplicatedDataError(
          `${orderId}에 해당되는 데이터가 이미 존재합니다.`,
        );

        await new model({
          _id: 1,
          bufferImage: Buffer.from('1'),
        }).save();

        await expect(
          repository.create({ orderId, bufferImage: Buffer.from('1') }),
        ).rejects.toStrictEqual(error);
      });
    });
  });
});

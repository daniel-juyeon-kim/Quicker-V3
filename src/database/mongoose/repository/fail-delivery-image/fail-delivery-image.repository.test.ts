import { afterEach } from '@jest/globals';
import { getModelToken, MongooseModule } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { UnknownDataBaseException } from '@src/core/module';
import {
  DuplicatedDataException,
  NotExistDataException,
} from '@src/database/type-orm';
import { mock } from 'jest-mock-extended';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Model } from 'mongoose';
import { FailDeliveryImage, FailDeliveryImageSchema } from '../../models';
import { FailDeliveryImageRepository } from './fail-delivery-image.repository';

describe('FailDeliveryImageRepository', () => {
  let mongod: MongoMemoryServer;
  let model: Model<FailDeliveryImage>;
  let repository: FailDeliveryImageRepository;
  let testModule: TestingModule;

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    const url = mongod.getUri();

    testModule = await Test.createTestingModule({
      imports: [
        MongooseModule.forRoot(url),
        MongooseModule.forFeature([
          {
            name: FailDeliveryImage.name,
            schema: FailDeliveryImageSchema,
          },
        ]),
      ],
      providers: [FailDeliveryImageRepository],
    }).compile();

    model = testModule.get(getModelToken(FailDeliveryImage.name));
    repository = testModule.get(FailDeliveryImageRepository);
  });

  afterAll(async () => {
    await testModule.close();
  });

  describe('findFailImageByOrderId()', () => {
    beforeAll(async () => {
      const image = new model({
        _id: 1,
        image: Buffer.from('1'),
        reason: '이유',
      });
      await image.save();
    });

    afterAll(async () => {
      await model.deleteMany();
    });

    test('통과하는 테스트', async () => {
      const orderId = 1;
      const result = {
        __v: 0,
        _id: orderId,
        image: { data: [49], type: 'Buffer' },
        reason: '이유',
      };

      expect(
        (await repository.findFailDeliveryImageByOrderId(orderId))?.toJSON(),
      ).toEqual(result);
    });

    test('실패하는 테스트, 존재하지 않는 값 입력', async () => {
      const orderId = 2;
      const error = new NotExistDataException(
        `${orderId}에 해당되는 실패 이미지가 존재하지 않습니다.`,
      );

      await expect(
        repository.findFailDeliveryImageByOrderId(orderId),
      ).rejects.toStrictEqual(error);
    });

    test('실패하는 테스트, 알 수 없는 에러 발생', async () => {
      const model = mock<Model<FailDeliveryImage>>();
      const error = new Error('알 수 없는 에러');
      model.findById.mockRejectedValue(error);

      const repository = new FailDeliveryImageRepository(model);
      const orderId = 1;

      await expect(
        repository.findFailDeliveryImageByOrderId(orderId),
      ).rejects.toBeInstanceOf(UnknownDataBaseException);
    });
  });

  describe('createFailDeliveryImage()', () => {
    afterEach(async () => {
      await model.deleteMany();
    });

    test('통과하는 테스트', async () => {
      const orderId = 1;
      const result = {
        __v: 0,
        _id: orderId,
        image: { data: [49], type: 'Buffer' },
        reason: '이유',
      };

      await repository.createFailDeliveryImage({
        orderId,
        bufferImage: Buffer.from('1'),
        reason: '이유',
      });

      expect((await model.findById(orderId))?.toJSON()).toEqual(result);
    });

    test('실패하는 테스트, 중복 데이터', async () => {
      const orderId = 1;
      const error = new DuplicatedDataException(
        `${orderId}에 해당되는 데이터가 이미 존재합니다.`,
      );

      const image = new model({
        _id: 1,
        image: Buffer.from('1'),
        reason: '이유',
      });
      await image.save();

      await expect(
        repository.createFailDeliveryImage({
          orderId,
          bufferImage: Buffer.from('1'),
          reason: '이유',
        }),
      ).rejects.toStrictEqual(error);
    });
  });
});

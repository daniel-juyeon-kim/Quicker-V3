import { afterEach } from '@jest/globals';
import { getModelToken, MongooseModule } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import {
  DuplicatedDataException,
  NotExistDataException,
  UnknownDataBaseException,
} from '@src/core/exception';
import { FindFailDeliveryImageDto } from '@src/router/order-image/dto/find-fail-image.dto';
import { plainToInstance } from 'class-transformer';
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
      const result = plainToInstance(FindFailDeliveryImageDto, {
        image: Buffer.from([49]),
        reason: '이유',
      });

      await expect(
        repository.findFailDeliveryImageByOrderId(orderId),
      ).resolves.toEqual(result);
    });

    test('실패하는 테스트, 존재하지 않는 값 입력', async () => {
      const orderId = 2;
      const error = new NotExistDataException(orderId);

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
        image: Buffer.from('1'),
        reason: '이유',
      };

      await repository.createFailDeliveryImage({
        orderId,
        image: Buffer.from('1'),
        reason: '이유',
      });

      const savedData = await model.findById(orderId);

      expect(Buffer.from(savedData.image)).toStrictEqual(result.image);
      expect(savedData.reason).toEqual(result.reason);
    });

    test('실패하는 테스트, 중복 데이터', async () => {
      const orderId = 1;
      const error = new DuplicatedDataException(orderId);

      const image = new model({
        _id: 1,
        image: Buffer.from('1'),
        reason: '이유',
      });
      await image.save();

      await expect(
        repository.createFailDeliveryImage({
          orderId,
          image: Buffer.from('1'),
          reason: '이유',
        }),
      ).rejects.toStrictEqual(error);
    });
  });
});

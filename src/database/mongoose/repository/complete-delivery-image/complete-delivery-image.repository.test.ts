import { MongooseModule, getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { DuplicatedDataException, NotExistDataException } from '@src/core';
import { FindCompleteDeliveryImageDto } from '@src/router/order-image/dto/find-complete-image.dto';
import { plainToInstance } from 'class-transformer';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Model } from 'mongoose';
import {
  CompleteDeliveryImage,
  CompleteDeliveryImageSchema,
} from '../../models';
import { CompleteDeliveryImageRepository } from './complete-delivery-image.repository';

describe('CompleteDeliveryImageRepository', () => {
  let mongod: MongoMemoryServer;
  let model: Model<CompleteDeliveryImage>;
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
        image: Buffer.from('1'),
      });

      await image.save();
    });

    afterEach(async () => {
      await model.deleteMany();
    });

    test('통과하는 테스트', async () => {
      const orderId = 1;
      const result = plainToInstance(FindCompleteDeliveryImageDto, {
        image: Buffer.from('1'),
      });

      await expect(
        repository.findCompleteImageBufferByOrderId(orderId),
      ).resolves.toEqual(result);
    });

    test('실패하는 테스트, 존재하지 않는 값 입력', async () => {
      const orderId = 3;
      const error = new NotExistDataException(orderId);

      await expect(
        repository.findCompleteImageBufferByOrderId(orderId),
      ).rejects.toEqual(error);
    });
  });

  describe('create 테스트', () => {
    afterEach(async () => {
      await model.deleteMany();
    });

    test('통과하는 테스트', async () => {
      const orderId = 1;
      const result = {
        image: Buffer.from([49]),
      };

      await repository.create({ orderId, image: Buffer.from([49]) });

      const plain = await model.findById(orderId);

      const instance = plainToInstance(FindCompleteDeliveryImageDto, plain, {
        excludeExtraneousValues: true,
      });

      expect(instance).toEqual(result);
    });

    describe('실패하는 테스트', () => {
      test('중복된 데이터', async () => {
        const orderId = 1;
        const error = new DuplicatedDataException(orderId);

        await new model({
          _id: 1,
          image: Buffer.from('1'),
        }).save();

        await expect(
          repository.create({ orderId, image: Buffer.from('1') }),
        ).rejects.toStrictEqual(error);
      });
    });
  });
});

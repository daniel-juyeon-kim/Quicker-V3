import { expect } from '@jest/globals';
import { getModelToken, MongooseModule } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { NotExistDataException } from '@src/core/exception';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Model } from 'mongoose';
import {
  CurrentDeliveryLocation,
  CurrentDeliveryLocationSchema,
} from '../../models';
import { CurrentDeliveryLocationRepository } from './current-delivery-location.repository';

describe('CurrentDeliverLocationRepository', () => {
  let mongod: MongoMemoryServer;
  let model: Model<CurrentDeliveryLocation>;
  let repository: CurrentDeliveryLocationRepository;
  let testModule: TestingModule;

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    const url = mongod.getUri();

    testModule = await Test.createTestingModule({
      imports: [
        MongooseModule.forRoot(url),
        MongooseModule.forFeature([
          {
            name: CurrentDeliveryLocation.name,
            schema: CurrentDeliveryLocationSchema,
          },
        ]),
      ],
      providers: [CurrentDeliveryLocationRepository],
    }).compile();

    model = testModule.get(getModelToken(CurrentDeliveryLocation.name));
    repository = testModule.get(CurrentDeliveryLocationRepository);
  });

  afterAll(async () => {
    await testModule.close();
  });

  describe('saveDeliveryPersonLocation', () => {
    afterEach(async () => {
      await model.deleteMany();
    });

    describe('통과하는 테스트', () => {
      test('최초 저장', async () => {
        const orderId = 1;
        const result = {
          _id: orderId,
          location: { x: 112.1314, y: 37.4 },
        };

        await repository.saveDeliveryPersonLocation(orderId, {
          x: 112.1314,
          y: 37.4,
        });

        await expect(
          model.findById(orderId).select(['-__v', '-location._id']).lean(),
        ).resolves.toEqual(result);
      });

      test('위치 정보 업데이트', async () => {
        const orderId = 1;
        const result = {
          _id: orderId,
          location: { x: 112.1333, y: 37.44 },
        };

        await repository.saveDeliveryPersonLocation(orderId, {
          x: 112.1333,
          y: 37.44,
        });

        await expect(
          model.findById(orderId).select(['-__v', '-location._id']).lean(),
        ).resolves.toEqual(result);
      });
    });
  });

  describe('findByWalletAddress', () => {
    beforeEach(async () => {
      await model.create({
        _id: 1,
        location: { x: 112.1313, y: 37.3 },
      });
    });

    afterEach(async () => {
      await model.deleteMany();
    });

    test('통과하는 테스트', async () => {
      const result = { x: 112.1313, y: 37.3 };
      const orderId = 1;

      await expect(
        repository.findCurrentLocationByOrderId(orderId),
      ).resolves.toEqual(result);
    });

    test('실패하는 테스트, 존재하지 않는 값 입력', async () => {
      const orderId = 99;
      const error = new NotExistDataException('orderId', orderId);

      await expect(
        repository.findCurrentLocationByOrderId(orderId),
      ).rejects.toStrictEqual(error);
    });
  });
});

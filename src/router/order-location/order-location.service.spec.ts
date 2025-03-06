import { Test, TestingModule } from '@nestjs/testing';
import { RepositoryToken } from '@src/core/constant';
import { NotExistDataException } from '@src/core/exception';
import { ILocationRepository } from '@src/database';
import { mock, mockClear } from 'jest-mock-extended';
import { OrderLocationService } from './order-location.service';

describe('OrderLocationService', () => {
  let service: OrderLocationService;

  const repository = mock<ILocationRepository>();
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrderLocationService,
        {
          provide: RepositoryToken.LOCATION_REPOSITORY,
          useValue: repository,
        },
      ],
    }).compile();

    service = module.get<OrderLocationService>(OrderLocationService);
    mockClear(repository);
  });

  describe('findDepartureDestinationByOrderId', () => {
    test('통과하는 테스트', async () => {
      const orderId = 1;
      const resolvedValue = {
        id: orderId,
        departure: { x: 34.1, y: 34.1 },
        destination: { x: 34.1, y: 34.1 },
      };
      repository.findDestinationDepartureByOrderId.mockResolvedValueOnce(
        resolvedValue,
      );

      await expect(
        service.findDepartureDestinationByOrderId(orderId),
      ).resolves.toStrictEqual(resolvedValue);
      expect(repository.findDestinationDepartureByOrderId).toHaveBeenCalledWith(
        orderId,
      );
    });

    test('실패하는 테스트', async () => {
      const orderId = 1;
      const error = new NotExistDataException('orderId', orderId);

      repository.findDestinationDepartureByOrderId.mockRejectedValueOnce(error);

      await expect(
        service.findDepartureDestinationByOrderId(orderId),
      ).rejects.toStrictEqual(error);
    });
  });
});

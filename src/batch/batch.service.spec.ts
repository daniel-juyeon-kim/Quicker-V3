import { Test, TestingModule } from '@nestjs/testing';
import { CoreToken } from '@src/core/constant';
import { ErrorMessageBot, TmapApi } from '@src/core/module';
import { Blockchain } from '@src/core/module/blockchain/blockchain.interface';
import { mock } from 'jest-mock-extended';
import { BatchService } from './batch.service';
import { BatchToken } from './constant/constant';
import { IRepository } from './repository/repository.service.interface';

describe('BatchService', () => {
  let service: BatchService;
  const repository = mock<IRepository>();
  const tmapApi = mock<TmapApi>();
  const blockChain = mock<Blockchain>();
  const errorMessageBot = mock<ErrorMessageBot>();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BatchService,
        {
          provide: BatchToken.REPOSITORY,
          useValue: repository,
        },
        {
          provide: TmapApi,
          useValue: tmapApi,
        },
        {
          provide: CoreToken.BLOCKCHAIN,
          useValue: blockChain,
        },
        {
          provide: CoreToken.ERROR_MESSAGE_BOT,
          useValue: errorMessageBot,
        },
      ],
    }).compile();

    service = module.get<BatchService>(BatchService);
  });

  describe('run', () => {
    test('통과하는 테스트', async () => {
      blockChain.findAllOrderPriceByOrderIds.mockResolvedValueOnce([]);
      tmapApi.requestRouteDistances.mockResolvedValueOnce([]);

      await service.run();

      expect(errorMessageBot.sendMessage).not.toHaveBeenCalled();
      expect(repository.saveAverageCost).toHaveBeenCalledTimes(1);
    });

    test('에러 발생 처리 테스트', async () => {
      repository.findAllDepartureDestinationByOrderIds.mockRejectedValueOnce(
        new Error(),
      );

      await service.run();

      expect(errorMessageBot.sendMessage).toHaveBeenCalled();
      expect(repository.saveAverageCost).not.toHaveBeenCalled();
    });
  });
});

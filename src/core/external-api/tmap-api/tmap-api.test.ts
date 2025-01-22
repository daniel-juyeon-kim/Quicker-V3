import { mock } from 'jest-mock-extended';
import fetch from 'node-fetch';

import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { TmapApi } from './tmap-api';
import { TmapApiError } from './tmap-api.error';
import { DestinationDepartureLocation } from './types';

jest.mock('node-fetch');

const configService = {
  provide: ConfigService,
  useValue: {
    get(value: string) {
      return value;
    },
  },
};

let tmapApi: TmapApi;

beforeEach(async () => {
  const module: TestingModule = await Test.createTestingModule({
    providers: [TmapApi, configService],
  }).compile();

  tmapApi = module.get<TmapApi>(TmapApi);
});

describe('TmapApi', () => {
  describe('requestRouteDistances()', () => {
    test('실패하는 테스트, 요청 후 에러 발생 시 TmapApiError를 던짐 ', async () => {
      const error = new Error('Fetch failed');
      (fetch as jest.MockedFunction<typeof fetch>).mockRejectedValueOnce(error);

      const mockLocation = mock<DestinationDepartureLocation>({
        id: 1,
        departure: { x: 127.1, y: 37.5 },
        destination: { x: 126.9, y: 37.6 },
      });

      await expect(
        tmapApi.requestRouteDistances([mockLocation]),
      ).resolves.toStrictEqual([
        {
          status: 'rejected',
          reason: new TmapApiError(error),
        },
      ]);
    });
  });
});

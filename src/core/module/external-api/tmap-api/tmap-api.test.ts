import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { TmapApiException } from '@src/core/exception';
import { mock } from 'jest-mock-extended';
import fetch from 'node-fetch';
import { TmapApi } from './tmap-api';
import {
  DestinationDepartureLocation,
  TmapApiErrorResponseBody,
} from './types';

jest.mock('node-fetch');

describe('TmapApi', () => {
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

  describe('requestRouteDistances', () => {
    test('실패하는 테스트, 요청 후 에러 발생 시 TmapApiError를 던짐 ', async () => {
      const error: TmapApiErrorResponseBody = {
        error: {
          id: 'id',
          category: 'map',
          code: '500',
          message: 'internal server error',
        },
      };

      (fetch as jest.MockedFunction<typeof fetch>).mockRejectedValueOnce(error);

      const mockLocation = mock<DestinationDepartureLocation>({
        id: 1,
        departure: { x: 127.1, y: 37.5 },
        destination: { x: 126.9, y: 37.6 },
      });

      await expect(
        tmapApi.requestRouteDistances([mockLocation]),
      ).rejects.toStrictEqual([new TmapApiException(error)]);
    });
  });
});

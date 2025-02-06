import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { tmapApiConfig } from '@src/core/config/configs';
import { isNull, validateResponse } from '@src/core/util';
import fetch from 'node-fetch';
import { TmapApiError } from '../../error/tmap-api.error';
import { Distance } from './distance';
import {
  DestinationDepartureLocation,
  RequestBody,
  ResponseBody,
} from './types';

@Injectable()
export class TmapApi {
  private readonly REQUEST_API_URL = `https://apis.openapi.sk.com/tmap/routes?version=1&format=json&appKey=`;
  private readonly appKey: string;
  private readonly KM = 1000;

  constructor(configService: ConfigService<ReturnType<typeof tmapApiConfig>>) {
    this.appKey = configService.get('tmapApiKey');
  }

  public async requestRouteDistances(
    locations: DestinationDepartureLocation[],
  ) {
    const promises = locations.map(async ({ id, departure, destination }) => {
      const requestBody = {
        totalValue: 2,
        startX: departure.x.toString(),
        startY: departure.y.toString(),
        endX: destination.x.toString(),
        endY: destination.y.toString(),
      };

      const distance = await this.requestRouteDistance(requestBody);

      if (isNull(distance)) {
        return null;
      }
      return new Distance(id, distance);
    });

    return await Promise.allSettled(promises);
  }

  private async requestRouteDistance(body: RequestBody) {
    try {
      const response = await fetch(this.REQUEST_API_URL + this.appKey, {
        method: 'POST',
        body: JSON.stringify(body),
      });

      await validateResponse(response);

      const responseBody = (await response.json()) as ResponseBody;
      const { totalDistance } = responseBody.features[0].properties;

      return this.floorByKM(totalDistance);
    } catch (e) {
      throw new TmapApiError(e);
    }
  }

  private floorByKM(totalDistance: number) {
    return totalDistance / this.KM;
  }
}

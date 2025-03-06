import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { tmapApiConfig } from '@src/core/config/configs';
import { TmapApiException } from '@src/core/exception';
import { isFulfilled, isNull, isZero, validateResponse } from '@src/core/util';
import fetch from 'node-fetch';
import { Distance } from './distance';
import {
  DestinationDepartureLocation,
  ErrorResponseBody,
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

      return isNull(distance) ? null : new Distance(id, distance);
    });

    const promiseAllSettledDistances = await Promise.allSettled(promises);

    const distances = promiseAllSettledDistances
      .filter((distance) => isFulfilled(distance))
      .map((distance) => distance.value);

    const errors = promiseAllSettledDistances
      .filter((distance) => distance.status === 'rejected')
      .map((rejectedPromise) => rejectedPromise.reason);

    if (!isZero(errors.length)) {
      throw errors;
    }

    return distances;
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

      return this.toKilometers(totalDistance);
    } catch (e) {
      const error: ErrorResponseBody = e;
      throw new TmapApiException(error);
    }
  }

  private toKilometers(totalDistance: number) {
    return totalDistance / this.KM;
  }
}

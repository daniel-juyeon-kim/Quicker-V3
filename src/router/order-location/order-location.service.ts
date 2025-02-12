import { Inject, Injectable } from '@nestjs/common';
import { RepositoryToken } from '@src/core/constant';
import { ILocationRepository } from '@src/database';
import { IOrderLocationService } from './order-location.service.interface';

@Injectable()
export class OrderLocationService implements IOrderLocationService {
  constructor(
    @Inject(RepositoryToken.LOCATION_REPOSITORY)
    private readonly repository: ILocationRepository,
  ) {}

  async findDepartureAndDestinationByOrderId(orderId: number) {
    return await this.repository.findDestinationDepartureByOrderId(orderId);
  }
}

import { Inject, Injectable } from '@nestjs/common';
import { RepositoryToken } from '@src/core/constant';
import { ILocationRepository } from '@src/database';
import { IOrderLocationService } from './order-location.service.interface';

@Injectable()
export class OrderLocationService implements IOrderLocationService {
  constructor(
    @Inject(RepositoryToken.LOCATION_REPOSITORY)
    private readonly locationRepository: ILocationRepository,
  ) {}

  async findDepartureDestinationByOrderId(orderId: number) {
    return await this.locationRepository.findDestinationDepartureByOrderId(
      orderId,
    );
  }
}

import { Global, Module } from '@nestjs/common';
import {
  ChatMessageRepository,
  CompleteDeliveryImageRepository,
  CurrentDeliveryLocationRepository,
  FailDeliveryImageRepository,
} from './mongoose';
import {
  AverageCostRepository,
  DeliveryPersonMatchedDateRepository,
  LocationRepository,
  OrderParticipantRepository,
  OrderRepository,
  ReceiverRepository,
  UserRepository,
} from './type-orm';

const mongoDbProviders = [
  ChatMessageRepository,
  CompleteDeliveryImageRepository,
  CurrentDeliveryLocationRepository,
  FailDeliveryImageRepository,
];
const typeOrmProviders = [
  AverageCostRepository,
  DeliveryPersonMatchedDateRepository,
  LocationRepository,
  OrderRepository,
  OrderParticipantRepository,
  ReceiverRepository,
  UserRepository,
];

@Global()
@Module({
  imports: [],
  providers: [...mongoDbProviders, ...typeOrmProviders],
  exports: [...mongoDbProviders, ...typeOrmProviders],
})
export class DatabaseModule {}

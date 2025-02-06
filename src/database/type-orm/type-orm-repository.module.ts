import { Module, Provider } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeOrmConfig } from '@src/core/config/configs';
import { RepositoryToken } from '@src/core/constant/repository';
import {
  AverageCostEntity,
  BirthDateEntity,
  DeliveryPersonMatchedDateEntity,
  DepartureEntity,
  DestinationEntity,
  JoinDateEntity,
  OrderEntity,
  ProductEntity,
  ProfileImageEntity,
  ReceiverEntity,
  SenderEntity,
  TransportationEntity,
  UserEntity,
} from './entity';
import {
  AverageCostRepository,
  DeliveryPersonMatchedDateRepository,
  LocationRepository,
  OrderParticipantRepository,
  OrderRepository,
  ReceiverRepository,
  UserRepository,
} from './repository';
import { TypeOrmOption } from './type-orm-option';

const entities = [
  AverageCostEntity,
  BirthDateEntity,
  DeliveryPersonMatchedDateEntity,
  DepartureEntity,
  DestinationEntity,
  JoinDateEntity,
  OrderEntity,
  ProductEntity,
  ProfileImageEntity,
  ReceiverEntity,
  SenderEntity,
  TransportationEntity,
  UserEntity,
];

const repositories: Provider[] = [
  {
    provide: RepositoryToken.AVERAGE_COST_REPOSITORY,
    useClass: AverageCostRepository,
  },
  {
    provide: RepositoryToken.DELIVERY_PERSON_MATCHED_DATE_REPOSITORY,
    useClass: DeliveryPersonMatchedDateRepository,
  },
  {
    provide: RepositoryToken.LOCATION_REPOSITORY,
    useClass: LocationRepository,
  },
  { provide: RepositoryToken.ORDER_REPOSITORY, useClass: OrderRepository },
  {
    provide: RepositoryToken.ORDER_PARTICIPANT_REPOSITORY,
    useClass: OrderParticipantRepository,
  },
  {
    provide: RepositoryToken.RECEIVER_REPOSITORY,
    useClass: ReceiverRepository,
  },
  { provide: RepositoryToken.USER_REPOSITORY, useClass: UserRepository },
];

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useClass: TypeOrmOption,
    }),
    TypeOrmModule.forFeature(entities),
    ConfigModule.forFeature(typeOrmConfig),
  ],
  providers: [...repositories],
  exports: [...repositories],
})
export class TypeOrmRepositoryModule {}

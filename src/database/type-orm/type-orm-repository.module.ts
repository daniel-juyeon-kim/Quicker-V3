import { Module, Provider } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeOrmConfig } from '@src/core/config/configs';
import { ENTITY_MANAGER_KEY } from '@src/core/constant/cls';
import { RepositoryToken } from '@src/core/constant/token/repository';
import { ClsModule } from 'nestjs-cls';
import { EntityManager } from 'typeorm';
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
import { TransactionManager } from './util/transaction/transaction-manager/transaction-manager';

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

const clsRootModule = ClsModule.forRootAsync({
  inject: [EntityManager],
  useFactory: (em) => {
    return {
      middleware: {
        mount: true,
        setup: (cls) => {
          cls.set(ENTITY_MANAGER_KEY, em);
        },
      },
    };
  },
});

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useClass: TypeOrmOption,
    }),
    TypeOrmModule.forFeature(entities),
    ConfigModule.forFeature(typeOrmConfig),
    clsRootModule,
  ],
  providers: [...repositories, TransactionManager],
  exports: [...repositories],
})
export class TypeOrmRepositoryModule {}

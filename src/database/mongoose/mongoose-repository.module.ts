import { Module, Provider } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { mongooseConfig } from '@src/config/configs';
import { RepositoryToken } from '@src/core/constant';
import {
  ChatMessages,
  ChatMessageSchema,
  CompleteDeliveryImage,
  CompleteDeliveryImageSchema,
  CurrentDeliveryLocation,
  CurrentDeliveryLocationSchema,
  FailDeliveryImage,
  FailDeliveryImageSchema,
} from './models';
import { MongooseOption } from './mongoose-option';
import {
  ChatMessageRepository,
  CompleteDeliveryImageRepository,
  CurrentDeliveryLocationRepository,
  FailDeliveryImageRepository,
} from './repository';

const models = [
  {
    name: ChatMessages.name,
    schema: ChatMessageSchema,
  },
  {
    name: CompleteDeliveryImage.name,
    schema: CompleteDeliveryImageSchema,
  },
  {
    name: CurrentDeliveryLocation.name,
    schema: CurrentDeliveryLocationSchema,
  },
  {
    name: FailDeliveryImage.name,
    schema: FailDeliveryImageSchema,
  },
];

const repositories: Provider[] = [
  {
    provide: RepositoryToken.CHAT_MESSAGE_REPOSITORY,
    useClass: ChatMessageRepository,
  },
  {
    provide: RepositoryToken.COMPLETE_DELIVERY_IMAGE_REPOSITORY,
    useClass: CompleteDeliveryImageRepository,
  },
  {
    provide: RepositoryToken.CURRENT_DELIVERY_LOCATION_REPOSITORY,
    useClass: CurrentDeliveryLocationRepository,
  },
  {
    provide: RepositoryToken.FAIL_DELIVERY_IMAGE_REPOSITORY,
    useClass: FailDeliveryImageRepository,
  },
];

@Module({
  imports: [
    MongooseModule.forRootAsync({
      useClass: MongooseOption,
    }),
    MongooseModule.forFeature(models),
    ConfigModule.forFeature(mongooseConfig),
  ],
  providers: [...repositories],
  exports: [...repositories],
})
export class MongooseRepositoryModule {}

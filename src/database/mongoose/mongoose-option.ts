import { Inject } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import {
  MongooseModuleOptions,
  MongooseOptionsFactory,
} from '@nestjs/mongoose';
import { mongooseConfig } from '@src/config/configs';

export class MongooseOption implements MongooseOptionsFactory {
  private readonly option: MongooseModuleOptions;

  constructor(
    @Inject(mongooseConfig.KEY)
    config: ConfigType<typeof mongooseConfig>,
  ) {
    this.option = {
      uri: config.uri,
      dbName: config.dbName,
    };
  }

  createMongooseOptions(): MongooseModuleOptions {
    return this.option;
  }
}

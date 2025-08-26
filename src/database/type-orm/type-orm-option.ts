import { Inject } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';
import { typeOrmConfig } from '@src/core/config/configs';
import { join } from 'path/posix';

export class TypeOrmOption implements TypeOrmOptionsFactory {
  private readonly option: TypeOrmModuleOptions;

  constructor(
    @Inject(typeOrmConfig.KEY)
    config: ConfigType<typeof typeOrmConfig>,
  ) {
    this.option = {
      type: 'mariadb',
      host: config.host,
      port: config.port,
      username: config.user,
      password: config.password,
      database: config.database,
      entities: [join(__dirname, '/entity/*.{t,j}s')],
    };
  }

  createTypeOrmOptions(connectionName?: string): TypeOrmModuleOptions {
    return this.option;
  }
}

import { Global, Module } from '@nestjs/common';
import { MongooseRepositoryModule } from './mongoose/mongoose-repository.module';
import { TypeOrmRepositoryModule } from './type-orm/type-orm-repository.module';

const repositoryModules = [TypeOrmRepositoryModule, MongooseRepositoryModule];

@Global()
@Module({
  imports: [...repositoryModules],
  exports: [...repositoryModules],
})
export class DatabaseModule {}

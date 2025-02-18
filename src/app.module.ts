import { Module } from '@nestjs/common';
import { BatchModule } from './batch/batch.module';
import { rootConfigModule } from './core/config/config.module';
import { FilterModule } from './core/filter/filter.module';
import { CoreModule } from './core/module';
import { DatabaseModule } from './database/database.module';
import { RouteModule } from './router/router.module';

@Module({
  imports: [
    rootConfigModule,
    CoreModule,
    DatabaseModule,
    FilterModule,
    RouteModule,
    BatchModule,
  ],
})
export class AppModule {}

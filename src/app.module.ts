import { Module } from '@nestjs/common';
import { rootConfigModule } from './core/config/config.module';
import { CoreModule } from './core/module';
import { DatabaseModule } from './database/database.module';
import { RouteModule } from './router/router.module';
import { FilterModule } from './core/filter/filter.module';
import { TestModule } from './test/test.module';

@Module({
  imports: [
    rootConfigModule,
    CoreModule,
    DatabaseModule,
    FilterModule,
    RouteModule,
    TestModule,
  ],
})
export class AppModule {}

import { Module } from '@nestjs/common';
import { BatchModule } from './batch/batch.module';
import { rootConfigModule } from './core/config/config.module';
import { FilterModule } from './core/filter/filter.module';
import { InterceptorModule } from './core/interceptor/interceptor.module';
import { CoreModule } from './core/module';
import { PipeModule } from './core/pipe/pipe.module';
import { DatabaseModule } from './database/database.module';
import { RouteModule } from './router/router.module';

@Module({
  imports: [
    rootConfigModule,
    CoreModule,
    DatabaseModule,
    InterceptorModule,
    PipeModule,
    RouteModule,
    FilterModule,
    BatchModule,
  ],
})
export class AppModule {}

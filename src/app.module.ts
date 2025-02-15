import { Module } from '@nestjs/common';
import { rootConfigModule } from './core/config/config.module';
import { GlobalExceptionFilterModule } from './core/filter/global/global-exception.filter.module';
import { CoreModule } from './core/module';
import { DatabaseModule } from './database/database.module';
import { RouteModule } from './router/router.module';

@Module({
  imports: [
    rootConfigModule,
    CoreModule,
    DatabaseModule,
    GlobalExceptionFilterModule,
    RouteModule,
  ],
})
export class AppModule {}

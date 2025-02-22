import { ClsPluginTransactional } from '@nestjs-cls/transactional';
import { TransactionalAdapterTypeOrm } from '@nestjs-cls/transactional-adapter-typeorm';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClsModule } from 'nestjs-cls';
import { DataSource } from 'typeorm';
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
    ClsModule.forRoot({
      plugins: [
        new ClsPluginTransactional({
          imports: [TypeOrmModule],
          adapter: new TransactionalAdapterTypeOrm({
            dataSourceToken: DataSource,
          }),
        }),
      ],
    }),
  ],
})
export class AppModule {}

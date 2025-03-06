import { Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { DatabaseExceptionFilter } from './database-exception/database-exception.filter';
import { DatabaseExceptionFilterModule } from './database-exception/database-exception.filter.module';
import { ExternalApiExceptionFilter } from './external-api-exception/external-api-exception.filter';
import { ExternalApiExceptionFilterModule } from './external-api-exception/external-api-exception.filter.module';
import { GlobalExceptionFilter } from './global/global-exception.filter';
import { BadRequestExceptionFilter } from './bad-request-exception/bad-request-exception.filter';

@Module({
  imports: [DatabaseExceptionFilterModule, ExternalApiExceptionFilterModule],
  providers: [
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },
    {
      provide: APP_FILTER,
      useClass: DatabaseExceptionFilter,
    },
    {
      provide: APP_FILTER,
      useClass: ExternalApiExceptionFilter,
    },
    {
      provide: APP_FILTER,
      useClass: BadRequestExceptionFilter,
    },
  ],
})
export class FilterModule {}

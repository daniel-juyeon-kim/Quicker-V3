import { Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { BadRequestExceptionFilter } from './bad-request-exception/bad-request-exception.filter';
import { GlobalExceptionFilter } from './global/global-exception.filter';
import { UnknownExceptionFilter } from './unknown-exception/unknown-exception.filter';
import { UnknownExceptionFilterModule } from './unknown-exception/unknown-exception.filter.module';

@Module({
  imports: [UnknownExceptionFilterModule],
  providers: [
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },
    {
      provide: APP_FILTER,
      useClass: UnknownExceptionFilter,
    },
    {
      provide: APP_FILTER,
      useClass: BadRequestExceptionFilter,
    },
  ],
})
export class FilterModule {}

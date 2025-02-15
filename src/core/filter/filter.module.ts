import { Module } from '@nestjs/common';
import { FilterLoggersModule } from '../module/filter-loggers/filter-loggers.module';
import { GlobalExceptionFilterModule } from './global/global-exception.filter.module';

@Module({
  imports: [FilterLoggersModule],
  providers: [GlobalExceptionFilterModule],
  exports: [GlobalExceptionFilterModule],
})
export class FilterModule {}

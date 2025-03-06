import { Module } from '@nestjs/common';
import { DatabaseExceptionHttpStatusMap } from './database-exception-http-status-map';

@Module({
  providers: [DatabaseExceptionHttpStatusMap],
  exports: [DatabaseExceptionHttpStatusMap],
})
export class DatabaseExceptionFilterModule {}

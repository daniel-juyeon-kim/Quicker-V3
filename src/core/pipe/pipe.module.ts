import { Module } from '@nestjs/common';
import { APP_PIPE } from '@nestjs/core';
import { RequestDataValidationPipe } from './request-data-validation/request-data-validation.pipe';

@Module({
  providers: [
    {
      provide: APP_PIPE,
      useClass: RequestDataValidationPipe,
    },
  ],
})
export class PipeModule {}

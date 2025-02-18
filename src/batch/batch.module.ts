import { Module } from '@nestjs/common';
import { BatchService } from './batch.service';
import { BatchToken } from './constant/constant';
import { RepositoryService } from './repository/repository.service';

@Module({
  providers: [
    BatchService,
    { provide: BatchToken.REPOSITORY, useClass: RepositoryService },
  ],
})
export class BatchModule {}

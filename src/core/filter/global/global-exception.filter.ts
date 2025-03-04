import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { CustomException } from '@src/core/exception/custom.exception';
import { DatabaseExceptionFilter } from '../database-exception/database-exception.filter';
import { ExternalApiExceptionFilter } from '../external-api-exception/external-api-exception.filter';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter<CustomException> {
  constructor(
    private readonly databaseExceptionFilter: DatabaseExceptionFilter,
    private readonly externalApiExceptionFilter: ExternalApiExceptionFilter,
  ) {}

  async catch(exception: CustomException, host: ArgumentsHost) {
    // 1. 데이터 베이스 계층 에러
    await this.databaseExceptionFilter.catch(exception, host);
    // 2. 외부 api 에러 확인
    await this.externalApiExceptionFilter.catch(exception, host);
  }
}

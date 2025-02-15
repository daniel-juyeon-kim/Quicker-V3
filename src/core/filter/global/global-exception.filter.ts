import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { CustomException } from '@src/core/module/exception/custom.exception';
import { DatabaseExceptionFilter } from '../database-exception/database-exception.filter';
import { ExternalApiExceptionFilter } from '../external-api-exception/external-api-exception.filter';
import { UnknownExceptionFilter } from '../unknown-exception/unknown-exception.filter';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter<CustomException> {
  constructor(
    private readonly databaseExceptionFilter: DatabaseExceptionFilter,
    private readonly unknownExceptionFilter: UnknownExceptionFilter,
    private readonly externalApiExceptionFilter: ExternalApiExceptionFilter,
  ) {}

  async catch(exception: CustomException, host: ArgumentsHost) {
    // 1. 데이터 베이스 계층 에러
    this.databaseExceptionFilter.catch(exception, host);
    // 2. 외부 api 에러 확인
    await this.externalApiExceptionFilter.catch(exception, host);
    // 3. 알 수 없는 에러
    await this.unknownExceptionFilter.catch(exception, host);
  }
}

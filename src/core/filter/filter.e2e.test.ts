import {
  Controller,
  Get,
  HttpStatus,
  INestApplication,
  LoggerService,
  Provider,
} from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { Test, TestingModule } from '@nestjs/testing';
import { mock } from 'jest-mock-extended';
import request from 'supertest';
import { CoreToken, LoggerToken } from '../constant';
import {
  DuplicatedDataException,
  ErrorMessageBotException,
  ExternalApiException,
  SmsApiException,
  TmapApiException,
} from '../exception';
import { CustomException } from '../exception/custom.exception';
import { ErrorMessageBot } from '../module';
import { NaverSmsApiResponse } from '../module/external-api/sms-api/naver-sms-api.response';
import { DatabaseExceptionHttpStatusMap } from './database-exception/database-exception-http-status-map';
import { DatabaseExceptionFilter } from './database-exception/database-exception.filter';
import { ExternalApiExceptionLoggerMap } from './external-api-exception/external-api-exception-logger-map';
import { ExternalApiExceptionFilter } from './external-api-exception/external-api-exception.filter';
import { GlobalExceptionFilter } from './global/global-exception.filter';

@Controller()
export class FilterTestController {
  @Get('/database')
  throwDuplicatedDataException() {
    throw new DuplicatedDataException();
  }

  @Get('/external-api')
  throwSmsApiException() {
    const error = {} as NaverSmsApiResponse;
    throw new SmsApiException(error);
  }

  @Get('/global')
  throwGlobalException() {
    class GlobalException extends CustomException {
      public target?: string;
      public value?: string | number;
      public cause: string;
    }

    throw new GlobalException();
  }
}

describe('Filter E2E, 여러개의 전역 필터가 등록되어 있다면 뒤에 있는 필터 부터 예외를 처리한다.', () => {
  let app: INestApplication;

  const unknownDataBaseExceptionLogger = mock<LoggerService>();
  const errorMessageBot = mock<ErrorMessageBot>();
  const globalExceptionLogger = mock<LoggerService>();
  const defaultExternalExceptionLogger = mock<LoggerService>();
  const errorMessageBotExceptionLogger = mock<LoggerService>();
  const smsApiExceptionLogger = mock<LoggerService>();
  const tmapApiExceptionLogger = mock<LoggerService>();

  const databaseExceptionFilterDependencies: Provider[] = [
    { provide: APP_FILTER, useClass: DatabaseExceptionFilter },
    DatabaseExceptionHttpStatusMap,
    {
      provide: LoggerToken.UNKNOWN_DATABASE_EXCEPTION_LOGGER,
      useValue: unknownDataBaseExceptionLogger,
    },
  ];

  const externalApiExceptionFilterDependencies: Provider[] = [
    {
      provide: APP_FILTER,
      useClass: ExternalApiExceptionFilter,
    },
    ExternalApiExceptionLoggerMap,
    {
      provide: Map,
      useFactory: (
        errorMessageBotExceptionLogger: LoggerService,
        smsApiExceptionLogger: LoggerService,
        tmapApiExceptionLogger: LoggerService,
      ) => {
        return new Map<typeof ExternalApiException, LoggerService>([
          [ErrorMessageBotException, errorMessageBotExceptionLogger],
          [SmsApiException, smsApiExceptionLogger],
          [TmapApiException, tmapApiExceptionLogger],
        ]);
      },
      inject: [
        LoggerToken.ERROR_MESSAGE_BOT_EXCEPTION_LOGGER,
        LoggerToken.SMS_API_EXCEPTION_LOGGER,
        LoggerToken.TMAP_API_EXCEPTION_LOGGER,
      ],
    },
    {
      provide: LoggerToken.EXTERNAL_API_EXCEPTION_LOGGER,
      useValue: defaultExternalExceptionLogger,
    },
    {
      provide: LoggerToken.ERROR_MESSAGE_BOT_EXCEPTION_LOGGER,
      useValue: errorMessageBotExceptionLogger,
    },
    {
      provide: LoggerToken.SMS_API_EXCEPTION_LOGGER,
      useValue: smsApiExceptionLogger,
    },
    {
      provide: LoggerToken.TMAP_API_EXCEPTION_LOGGER,
      useValue: tmapApiExceptionLogger,
    },
  ];

  const globalExceptionFilterDependencies: Provider[] = [
    { provide: APP_FILTER, useClass: GlobalExceptionFilter },
    {
      provide: CoreToken.ERROR_MESSAGE_BOT,
      useValue: errorMessageBot,
    },
    {
      provide: LoggerToken.GLOBAL_EXCEPTION_LOGGER,
      useValue: globalExceptionLogger,
    },
  ];

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [FilterTestController],
      providers: [
        ...globalExceptionFilterDependencies,
        ...externalApiExceptionFilterDependencies,
        ...databaseExceptionFilterDependencies,
        {
          provide: CoreToken.ERROR_MESSAGE_BOT,
          useValue: errorMessageBot,
        },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should return filtered results', async () => {
    await request(app.getHttpServer())
      .get('/database')
      .expect(HttpStatus.CONFLICT);
  });

  it('should return 400 for invalid filter parameter', async () => {
    await request(app.getHttpServer())
      .get('/external-api')
      .expect(HttpStatus.BAD_GATEWAY);
  });

  it('should return empty array for no matching results', async () => {
    await request(app.getHttpServer())
      .get('/global')
      .expect(HttpStatus.INTERNAL_SERVER_ERROR);
  });
});

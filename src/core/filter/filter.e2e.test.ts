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
  SmsApiException,
  TmapApiException,
  UnknownDataBaseException,
  UnknownException,
} from '../exception';
import { ErrorMessageBot } from '../module';
import { NaverSmsApiResponse } from '../module/external-api/sms-api/naver-sms-api.response';
import { GlobalExceptionFilter } from './global/global-exception.filter';
import { UnknownExceptionLoggerMap } from './unknown-exception/unknown-exception-logger-map';
import { UnknownExceptionFilter } from './unknown-exception/unknown-exception.filter';

@Controller()
export class FilterTestController {
  @Get('/database')
  throwDuplicatedDataException() {
    throw new DuplicatedDataException('error');
  }

  @Get('/external-api')
  throwSmsApiException() {
    const error = {} as NaverSmsApiResponse;
    throw new SmsApiException(error);
  }

  @Get('/global')
  throwGlobalException() {
    throw new Error();
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

  const externalApiExceptionFilterDependencies: Provider[] = [
    {
      provide: APP_FILTER,
      useClass: UnknownExceptionFilter,
    },
    UnknownExceptionLoggerMap,
    {
      provide: Map,
      useFactory: (
        errorMessageBotExceptionLogger: LoggerService,
        smsApiExceptionLogger: LoggerService,
        tmapApiExceptionLogger: LoggerService,
        unknownDataBaseExceptionLogger: LoggerService,
      ) => {
        return new Map<typeof UnknownException, LoggerService>([
          [ErrorMessageBotException, errorMessageBotExceptionLogger],
          [SmsApiException, smsApiExceptionLogger],
          [TmapApiException, tmapApiExceptionLogger],
          [UnknownDataBaseException, unknownDataBaseExceptionLogger],
        ]);
      },
      inject: [
        LoggerToken.ERROR_MESSAGE_BOT_EXCEPTION_LOGGER,
        LoggerToken.SMS_API_EXCEPTION_LOGGER,
        LoggerToken.TMAP_API_EXCEPTION_LOGGER,
        LoggerToken.UNKNOWN_DATABASE_EXCEPTION_LOGGER,
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
    {
      provide: LoggerToken.UNKNOWN_DATABASE_EXCEPTION_LOGGER,
      useValue: unknownDataBaseExceptionLogger,
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

  it('데이터 베이스 예외는 BaseFilter로 위임', async () => {
    await request(app.getHttpServer())
      .get('/database')
      .expect(HttpStatus.CONFLICT);
  });

  it('외부 api는 UnknownExceptionFilter가 처리', async () => {
    await request(app.getHttpServer())
      .get('/external-api')
      .expect(HttpStatus.BAD_GATEWAY);
  });

  it('httpException이 아니면 전역 필터가 처리', async () => {
    await request(app.getHttpServer())
      .get('/global')
      .expect(HttpStatus.INTERNAL_SERVER_ERROR);
  });
});

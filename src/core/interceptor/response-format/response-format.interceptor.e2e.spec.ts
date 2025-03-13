import { Controller, Get, INestApplication } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { ResponseFormatInterceptor } from './response-format.interceptor';

@Controller()
export class TestController {
  @Get()
  getHello() {
    return 'Hello World';
  }

  @Get('void')
  getEmpty() {}
}

describe('ResponseFormatInterceptor (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [TestController],
      providers: [
        {
          provide: APP_INTERCEPTOR,
          useClass: ResponseFormatInterceptor,
        },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/ (GET)', async () => {
    const res = await request(app.getHttpServer()).get('/');

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      code: 200,
      message: 'OK',
      data: 'Hello World',
    });
  });

  it('/ (GET)', async () => {
    const res = await request(app.getHttpServer()).get('/void');

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      code: 200,
      message: 'OK',
    });
  });
});

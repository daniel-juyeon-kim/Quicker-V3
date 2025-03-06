import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { SmsApiException } from '@src/core/exception';
import fetch from 'node-fetch';
import { NaverSmsApi } from './naver-sms-api';
import { NaverSmsApiResponse } from './naver-sms-api.response';

jest.mock('node-fetch');

let smsService: NaverSmsApi;

const configService = {
  provide: ConfigService,
  useValue: {
    get(value: string) {
      const map = {
        accesskey: 'accesskey',
        secretkey: 'secretkey',
        serviceId: 'serviceId',
        fromNumber: '01012341234',
      };

      return map[value];
    },
  },
};

beforeEach(async () => {
  const module: TestingModule = await Test.createTestingModule({
    providers: [NaverSmsApi, configService],
  }).compile();

  smsService = module.get<NaverSmsApi>(NaverSmsApi);
});

describe('NaverSmsApi 테스트', () => {
  describe('sendDeliveryTrackingMessage() 테스트', () => {
    test('실패 처리 테스트, SmsApiError를 던짐', async () => {
      const deliveryTrackingUrl = 'https://~~~~';
      const receiverPhoneNumber = '01012341234';
      const error: NaverSmsApiResponse = {
        requestId: 'id1',
        requestTime: new Date().toString(),
        statusCode: '500',
        statusName: 'internal server error',
      };

      (fetch as jest.MockedFunction<typeof fetch>).mockRejectedValueOnce(error);

      await expect(
        smsService.sendDeliveryTrackingMessage(
          deliveryTrackingUrl,
          receiverPhoneNumber,
        ),
      ).rejects.toStrictEqual(new SmsApiException(error));
    });
  });
});

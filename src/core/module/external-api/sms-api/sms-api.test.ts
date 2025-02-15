import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import fetch from 'node-fetch';
import { NaverSmsApi, SmsApiException } from '..';

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
      const error = new Error('알 수 없는 에러');

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

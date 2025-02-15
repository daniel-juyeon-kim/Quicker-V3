import { WebClient } from '@slack/web-api';

import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { mock } from 'jest-mock-extended';
import { ErrorMessage, ErrorMessageBotException, SlackBot } from '../..';

const webClient = {
  provide: WebClient,
  useValue: mock<WebClient>(),
};

const configService = {
  provide: ConfigService,
  useValue: {
    get() {
      return 'value';
    },
  },
};

let slackBot;

beforeEach(async () => {
  const testModule = await Test.createTestingModule({
    providers: [SlackBot, webClient, configService],
  }).compile();

  slackBot = testModule.get(SlackBot);
});

describe('SlackBot 테스트', () => {
  describe('sendMessage()', () => {
    test('에러 처리 테스트 ,ErrorMessageBotError', async () => {
      webClient.useValue.chat.postMessage = jest
        .fn()
        .mockResolvedValueOnce({ ok: false });

      const date = new Date(2000, 1, 1);
      const error = new Error('에러 메시지');

      await expect(
        slackBot.sendMessage(new ErrorMessage({ date, exception: error })),
      ).rejects.toStrictEqual(new ErrorMessageBotException(error));
    });
  });
});

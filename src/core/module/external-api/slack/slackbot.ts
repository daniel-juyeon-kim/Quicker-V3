import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ChatPostMessageResponse, WebClient } from '@slack/web-api';
import { slackbotConfig } from '@src/core/config/configs';
import { ErrorMessageBotException } from '@src/core/exception';
import { ErrorMessage } from './error-message';
import { ErrorMessageBot } from './error-message-bot.interface';

@Injectable()
export class SlackBot implements ErrorMessageBot {
  private readonly channelId: string;

  constructor(
    private readonly client: WebClient,
    configService: ConfigService<ReturnType<typeof slackbotConfig>>,
  ) {
    this.channelId = configService.get('channelId');
  }

  public async sendMessage(message: ErrorMessage<unknown>) {
    try {
      const response = await this.client.chat.postMessage({
        text: message.parseToStringForSlack(),
        channel: this.channelId,
      });

      this.validateResponse(response);
    } catch (e) {
      const error: ChatPostMessageResponse = e;
      throw new ErrorMessageBotException(error);
    }
  }

  private validateResponse(response: ChatPostMessageResponse) {
    if (response.ok) {
      return;
    }
    throw response;
  }
}

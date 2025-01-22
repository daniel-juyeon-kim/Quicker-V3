import { registerAs } from '@nestjs/config';

export const slackbotConfig = registerAs('slackbot', () => ({
  token: process.env.SLACK_BOT_TOKEN,
  channelId: process.env.SLACK_BOT_CHANNEL_ID,
}));

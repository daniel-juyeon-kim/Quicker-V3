export interface SmsApi {
  sendDeliveryTrackingMessage(url: string, to: string): Promise<void>;
}

export interface Body {
  type: string;
  from: string;
  content: string;
  messages: {
    to: string;
  }[];
}

export interface Headers {
  'Content-Type': string;
  'x-ncp-apigw-timestamp': string;
  'x-ncp-iam-access-key': string;
  'x-ncp-apigw-signature-v2': string;
}

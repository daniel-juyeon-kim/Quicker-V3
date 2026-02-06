import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { keyCreatorConfig } from '@src/core/config/configs';
import CryptoJS from 'crypto-js';

@Injectable()
export class DeliveryUrlCreator {
  private readonly encryptKey: string;
  private readonly baseUrl: string;

  constructor(
    configService: ConfigService<ReturnType<typeof keyCreatorConfig>>,
  ) {
    this.encryptKey = configService.get('urlCryptoKey');
    this.baseUrl = configService.get('baseUrl');
  }

  createUrl(body: { orderId: number; walletAddress: string }) {
    // 1. 의뢰 아이디와 배송원 지갑주소를 암호화하고 url 링크를 클라이언트에게 메시지로 전달(클라이언트 키를 통해 복호화 할 수 있도록함)
    // 2. 클라이언트 복호화 키를 통해 암호화된 url을 복호화, 해당 데이터로 배송원의 현재위치등을 조회

    // NOTE:
    // 클라이언트에서 주문 아이디와 지갑주소를 통해 복호화 함,
    // 해당 url정보를 받는 수취인은 서비스에 가입 되어있지 않을 수 있어서 orderId와 walletAddress가 필요함
    const encryptedUrlParameter = this.createUrlParameter(body);

    return this.baseUrl + 'recipient/?key=' + encryptedUrlParameter;
  }

  private createUrlParameter(body: { orderId: number; walletAddress: string }) {
    return CryptoJS.AES.encrypt(
      JSON.stringify(body),
      this.encryptKey,
    ).toString();
  }
}

import { BadRequestException } from '@nestjs/common';
import { ValidateWalletAddressPipe } from './wallet-address.pipe';

describe('ValidateWalletAddressPipe', () => {
  let pipe: ValidateWalletAddressPipe;

  beforeEach(() => {
    pipe = new ValidateWalletAddressPipe();
  });

  it('통과하는 테스트, 이더리움 지갑주소의 형식이 맞으면 통과', () => {
    const validAddress = '0x742d35Cc6634C0532925a3b844Bc454e4438f44e';

    expect(pipe.transform(validAddress, { type: 'param' })).toBe(validAddress);
  });

  it('실패하는 테스트, 이더리움 지갑주소의 형식이 아니면 BadRequestException을 던짐', () => {
    const invalidAddress = 'invalid_wallet_address';

    expect(() => pipe.transform(invalidAddress, { type: 'param' })).toThrow(
      BadRequestException,
    );
  });
});

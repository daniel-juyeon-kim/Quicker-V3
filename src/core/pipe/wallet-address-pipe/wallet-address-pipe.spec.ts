import { BadRequestException } from '@nestjs/common';
import { ValidateWalletAddressPipe } from './wallet-address.pipe';

describe('ValidateWalletAddressPipe', () => {
  let pipe: ValidateWalletAddressPipe;

  beforeEach(() => {
    pipe = new ValidateWalletAddressPipe();
  });

  it('이더리움 지갑 주소 형식이 올바른 경우 통과해야 한다', () => {
    const validAddress = '0x742d35Cc6634C0532925a3b844Bc454e4438f44e';

    expect(pipe.transform(validAddress, { type: 'param' })).toBe(validAddress);
  });

  it('이더리움 지갑 주소 형식이 올바르지 않은 경우 BadRequestException을 던져야 한다', () => {
    const invalidAddress = 'invalid_wallet_address';

    expect(() => pipe.transform(invalidAddress, { type: 'param' })).toThrow(
      BadRequestException,
    );
  });

  it('불리언 입력에 대해 BadRequestException을 던져야 한다', () => {
    const booleanInput = true;

    expect(() => pipe.transform(booleanInput, { type: 'param' })).toThrow(
      BadRequestException,
    );
  });

  it('숫자 입력에 대해 BadRequestException을 던져야 한다', () => {
    const numericInput = 1234;

    expect(() => pipe.transform(numericInput, { type: 'param' })).toThrow(
      BadRequestException,
    );
  });

  it('객체 입력에 대해 BadRequestException을 던져야 한다', () => {
    const objectInput = { '0234': '5234' };

    expect(() => pipe.transform(objectInput, { type: 'param' })).toThrow(
      BadRequestException,
    );
  });

  it('빈 문자열에 대해 BadRequestException을 던져야 한다', () => {
    const emptyString = '';

    expect(() => pipe.transform(emptyString, { type: 'param' })).toThrow(
      BadRequestException,
    );
  });

  it('null 입력에 대해 BadRequestException을 던져야 한다', () => {
    const nullInput = null;

    expect(() => pipe.transform(nullInput, { type: 'param' })).toThrow(
      BadRequestException,
    );
  });

  it('undefined 입력에 대해 BadRequestException을 던져야 한다', () => {
    const undefinedInput = undefined;

    expect(() => pipe.transform(undefinedInput, { type: 'param' })).toThrow(
      BadRequestException,
    );
  });
});

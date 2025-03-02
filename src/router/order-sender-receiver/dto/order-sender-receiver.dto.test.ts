import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { OrderSenderReceiverDto } from './order-sender-receiver.dto';

describe('OrderSenderReceiverDto', () => {
  it('올바른 데이터로 성공적으로 검증되어야 한다', async () => {
    const data = {
      id: 1,
      departure: {
        x: 0,
        y: 0,
        sender: { phone: '01012345678' },
      },
      destination: {
        x: 37.5,
        y: 112,
        receiver: { phone: '01012345678' },
      },
    };

    const dto = plainToInstance(OrderSenderReceiverDto, data);
    const errors = await validate(dto);

    expect(errors.length).toBe(0);
  });

  it('잘못된 전화번호로 검증에 실패해야 한다', async () => {
    const data = {
      id: 1,
      departure: {
        x: 0,
        y: 0,
        sender: { phone: 'invalid-phone' },
      },
      destination: {
        x: 37.5,
        y: 112,
        receiver: { phone: 'invalid-phone' },
      },
    };
    const error = [
      {
        children: [
          {
            children: [
              {
                children: [],
                constraints: {
                  isPhoneNumber: 'phone must be a valid phone number',
                },
                property: 'phone',
                target: { phone: 'invalid-phone' },
                value: 'invalid-phone',
              },
            ],
            property: 'sender',
            target: { sender: { phone: 'invalid-phone' }, x: 0, y: 0 },
            value: { phone: 'invalid-phone' },
          },
        ],
        property: 'departure',
        target: {
          departure: { sender: { phone: 'invalid-phone' }, x: 0, y: 0 },
          destination: {
            receiver: { phone: 'invalid-phone' },
            x: 37.5,
            y: 112,
          },
          id: 1,
        },
        value: { sender: { phone: 'invalid-phone' }, x: 0, y: 0 },
      },
      {
        children: [
          {
            children: [
              {
                children: [],
                constraints: {
                  isPhoneNumber: 'phone must be a valid phone number',
                },
                property: 'phone',
                target: { phone: 'invalid-phone' },
                value: 'invalid-phone',
              },
            ],
            property: 'receiver',
            target: { receiver: { phone: 'invalid-phone' }, x: 37.5, y: 112 },
            value: { phone: 'invalid-phone' },
          },
        ],
        property: 'destination',
        target: {
          departure: { sender: { phone: 'invalid-phone' }, x: 0, y: 0 },
          destination: {
            receiver: { phone: 'invalid-phone' },
            x: 37.5,
            y: 112,
          },
          id: 1,
        },
        value: { receiver: { phone: 'invalid-phone' }, x: 37.5, y: 112 },
      },
    ];

    const dto = plainToInstance(OrderSenderReceiverDto, data);
    const errors = await validate(dto);

    expect(errors).toEqual(error);
  });

  it('음수 ID로 검증에 실패해야 한다', async () => {
    const data = {
      id: -1,
      departure: {
        x: 0,
        y: 0,
        sender: { phone: '01012345678' },
      },
      destination: {
        x: 37.5,
        y: 112,
        receiver: { phone: '01012345678' },
      },
    };

    const dto = plainToInstance(OrderSenderReceiverDto, data);
    const errors = await validate(dto);

    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].constraints).toHaveProperty('isPositive');
  });

  it('필수 필드가 누락된 경우 검증에 실패해야 한다', async () => {
    const data = {
      id: 1,
      departure: {
        x: 0,
        y: 0,
        sender: {},
      },
      destination: {
        x: 37.5,
        y: 112,
        receiver: {},
      },
    };
    const error = [
      {
        children: [
          {
            children: [
              {
                children: [],
                constraints: {
                  isPhoneNumber: 'phone must be a valid phone number',
                },
                property: 'phone',
                target: {},
                value: undefined,
              },
            ],
            property: 'sender',
            target: { sender: {}, x: 0, y: 0 },
            value: {},
          },
        ],
        property: 'departure',
        target: {
          departure: { sender: {}, x: 0, y: 0 },
          destination: { receiver: {}, x: 37.5, y: 112 },
          id: 1,
        },
        value: { sender: {}, x: 0, y: 0 },
      },
      {
        children: [
          {
            children: [
              {
                children: [],
                constraints: {
                  isPhoneNumber: 'phone must be a valid phone number',
                },
                property: 'phone',
                target: {},
                value: undefined,
              },
            ],
            property: 'receiver',
            target: { receiver: {}, x: 37.5, y: 112 },
            value: {},
          },
        ],
        property: 'destination',
        target: {
          departure: { sender: {}, x: 0, y: 0 },
          destination: { receiver: {}, x: 37.5, y: 112 },
          id: 1,
        },
        value: { receiver: {}, x: 37.5, y: 112 },
      },
    ];

    const dto = plainToInstance(OrderSenderReceiverDto, data);
    const errors = await validate(dto);

    expect(errors).toEqual(error);
  });
});

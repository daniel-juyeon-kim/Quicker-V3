import { ValidationError } from '@nestjs/common';
import { RequestDataValidationError } from './request-data-validation-error';

describe('ValidationError', () => {
  describe('1단계', () => {
    test('children 속성이 없음', () => {
      const testValue: ValidationError[] = [
        {
          constraints: {
            제약조건: '제약조건 위반 메시지',
          },
          property: 'address',
          target: {
            email: 'test@example.com',
            password: 'password123',
            address: { street: 'St', city: 'A' },
          },
          value: { street: 'St', city: 'A' },
        },
      ];

      const response = new RequestDataValidationError({
        validationErrors: testValue,
        paramType: 'body',
      });

      expect(response.createValidationErrorResponseBody()).toEqual([
        {
          paramType: 'body',
          message: ['제약조건 위반 메시지'],
          property: 'address',
          value: { city: 'A', street: 'St' },
        },
      ]);
    });

    test('children 속성이 빈 배열', () => {
      const testValue: ValidationError[] = [
        {
          children: [],
          constraints: {
            제약조건: '제약조건 위반 메시지',
          },
          property: 'address',
          target: {
            email: 'test@example.com',
            password: 'password123',
            address: { street: 'St', city: 'A' },
          },
          value: { street: 'St', city: 'A' },
        },
      ];

      const response = new RequestDataValidationError({
        validationErrors: testValue,
        paramType: 'body',
      });

      expect(response.createValidationErrorResponseBody()).toEqual([
        {
          paramType: 'body',
          message: ['제약조건 위반 메시지'],
          property: 'address',
          value: { city: 'A', street: 'St' },
        },
      ]);
    });
  });

  describe('2단계', () => {
    test('children 속성에 중첩으로 ValidationError가 있음', () => {
      const testValue: ValidationError[] = [
        {
          children: [
            {
              children: [],
              constraints: {
                isLength: 'street must be longer than or equal to 5 characters',
              },
              property: 'street',
              target: { street: 'St', city: 'A' },
              value: 'St',
            },
            {
              children: [],
              constraints: {
                isLength: 'city must be longer than or equal to 2 characters',
              },
              property: 'city',
              target: { street: 'St', city: 'A' },
              value: 'A',
            },
          ],
          constraints: {
            제약조건: '제약조건 위반 메시지',
          },
          property: 'address',
          target: {
            email: 'test@example.com',
            password: 'password123',
            address: { street: 'St', city: 'A' },
          },
          value: { street: 'St', city: 'A' },
        },
      ];

      const response = new RequestDataValidationError({
        validationErrors: testValue,
        paramType: 'body',
      });

      expect(response.createValidationErrorResponseBody()).toEqual([
        {
          paramType: 'body',
          message: ['제약조건 위반 메시지'],
          property: 'address',
          value: { city: 'A', street: 'St' },
        },
        {
          paramType: 'body',
          message: ['street must be longer than or equal to 5 characters'],
          property: 'street',
          value: 'St',
        },
        {
          paramType: 'body',
          message: ['city must be longer than or equal to 2 characters'],
          property: 'city',
          value: 'A',
        },
      ]);
    });

    test('1뎁스에 에러가 여러개고 children 속성에 중첩으로 ValidationError가 있음', () => {
      const testValue = [
        {
          children: [
            {
              children: [
                {
                  constraints: {
                    isLength:
                      'street must be longer than or equal to 5 characters',
                  },
                  property: 'street',
                  target: { street: 'St', city: 'A' },
                  value: 'St',
                },
              ],
              constraints: {
                isLength: 'street must be longer than or equal to 5 characters',
              },
              property: 'street',
              target: { street: 'St', city: 'A' },
              value: 'St',
            },
            {
              children: [],
              constraints: {
                isLength: 'city must be longer than or equal to 2 characters',
              },
              property: 'city',
              target: { street: 'St', city: 'A' },
              value: 'A',
            },
          ],
          property: 'address',
          target: {
            email: 'test@example.com',
            password: 'password123',
            address: { street: 'St', city: 'A' },
          },
          value: { street: 'St', city: 'A' },
        },
        {
          children: [
            {
              children: [
                {
                  constraints: {
                    isLength:
                      'street must be longer than or equal to 5 characters',
                  },
                  property: 'street',
                  target: { street: 'St', city: 'A' },
                  value: 'St',
                },
              ],
              constraints: {
                isLength: 'street must be longer than or equal to 5 characters',
              },
              property: 'street',
              target: { street: 'St', city: 'A' },
              value: 'St',
            },
            {
              children: [],
              constraints: {
                isLength: 'city must be longer than or equal to 2 characters',
              },
              property: 'city',
              target: { street: 'St', city: 'A' },
              value: 'A',
            },
          ],
          property: 'address',
          target: {
            email: 'test@example.com',
            password: 'password123',
            address: { street: 'St', city: 'A' },
          },
          value: { street: 'St', city: 'A' },
        },
      ];

      const response = new RequestDataValidationError({
        validationErrors: testValue,
        paramType: 'body',
      });

      expect(response.createValidationErrorResponseBody()).toEqual([
        {
          paramType: 'body',
          constraints: undefined,
          property: 'address',
          value: { city: 'A', street: 'St' },
        },
        {
          paramType: 'body',
          message: ['street must be longer than or equal to 5 characters'],
          property: 'street',
          value: 'St',
        },
        {
          paramType: 'body',
          message: ['street must be longer than or equal to 5 characters'],
          property: 'street',
          value: 'St',
        },
        {
          paramType: 'body',
          message: ['city must be longer than or equal to 2 characters'],
          property: 'city',
          value: 'A',
        },
        {
          paramType: 'body',
          constraints: undefined,
          property: 'address',
          value: { city: 'A', street: 'St' },
        },
        {
          paramType: 'body',
          message: ['street must be longer than or equal to 5 characters'],
          property: 'street',
          value: 'St',
        },
        {
          paramType: 'body',
          message: ['street must be longer than or equal to 5 characters'],
          property: 'street',
          value: 'St',
        },
        {
          paramType: 'body',
          message: ['city must be longer than or equal to 2 characters'],
          property: 'city',
          value: 'A',
        },
      ]);
    });
  });
});

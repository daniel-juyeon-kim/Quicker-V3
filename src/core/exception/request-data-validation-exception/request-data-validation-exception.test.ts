import { HttpStatus, ValidationError } from '@nestjs/common';
import { RequestDataValidationException } from './request-data-validation-exception';

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

      const response = new RequestDataValidationException({
        validationErrors: testValue,
        paramType: 'body',
      });

      expect(response.getResponse()).toEqual({
        code: HttpStatus.BAD_REQUEST,
        message: HttpStatus[HttpStatus.BAD_REQUEST],
        error: [
          {
            message: ['제약조건 위반 메시지'],
            paramType: 'body',
            property: 'address',
            value: { city: 'A', street: 'St' },
          },
        ],
      });
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

      const response = new RequestDataValidationException({
        validationErrors: testValue,
        paramType: 'body',
      });

      expect(response.getResponse()).toEqual({
        code: HttpStatus.BAD_REQUEST,
        message: HttpStatus[HttpStatus.BAD_REQUEST],
        error: [
          {
            message: ['제약조건 위반 메시지'],
            paramType: 'body',
            property: 'address',
            value: { city: 'A', street: 'St' },
          },
        ],
      });
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

      const response = new RequestDataValidationException({
        validationErrors: testValue,
        paramType: 'body',
      });

      expect(response.getResponse()).toEqual({
        code: HttpStatus.BAD_REQUEST,
        message: HttpStatus[HttpStatus.BAD_REQUEST],
        error: [
          {
            message: ['제약조건 위반 메시지'],
            paramType: 'body',
            property: 'address',
            value: { city: 'A', street: 'St' },
          },
          {
            message: ['street must be longer than or equal to 5 characters'],
            paramType: 'body',
            property: 'street',
            value: 'St',
          },
          {
            message: ['city must be longer than or equal to 2 characters'],
            paramType: 'body',
            property: 'city',
            value: 'A',
          },
        ],
      });
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

      const response = new RequestDataValidationException({
        validationErrors: testValue,
        paramType: 'body',
      });

      expect(response.getResponse()).toEqual({
        code: HttpStatus.BAD_REQUEST,
        message: HttpStatus[HttpStatus.BAD_REQUEST],
        error: [
          {
            message: undefined,
            paramType: 'body',
            property: 'address',
            value: { city: 'A', street: 'St' },
          },
          {
            message: ['street must be longer than or equal to 5 characters'],
            paramType: 'body',
            property: 'street',
            value: 'St',
          },
          {
            message: ['street must be longer than or equal to 5 characters'],
            paramType: 'body',
            property: 'street',
            value: 'St',
          },
          {
            message: ['city must be longer than or equal to 2 characters'],
            paramType: 'body',
            property: 'city',
            value: 'A',
          },
          {
            message: undefined,
            paramType: 'body',
            property: 'address',
            value: { city: 'A', street: 'St' },
          },
          {
            message: ['street must be longer than or equal to 5 characters'],
            paramType: 'body',
            property: 'street',
            value: 'St',
          },
          {
            message: ['street must be longer than or equal to 5 characters'],
            paramType: 'body',
            property: 'street',
            value: 'St',
          },
          {
            message: ['city must be longer than or equal to 2 characters'],
            paramType: 'body',
            property: 'city',
            value: 'A',
          },
        ],
      });
    });
  });
});

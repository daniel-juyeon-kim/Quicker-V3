import { ValidationOptions, registerDecorator } from 'class-validator';

export function IsNumberEqual(
  expect: number,
  validationOptions?: ValidationOptions,
) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isNumberOne',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions
        ? validationOptions
        : {
            message: ({ value, property }) =>
              `${property}속성에 ${value}는 제약조건에 충돌합니다.`,
          },
      validator: {
        validate(value: number) {
          return value === expect;
        },
      },
    });
  };
}

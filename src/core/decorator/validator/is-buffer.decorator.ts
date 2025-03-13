import { registerDecorator, ValidationOptions } from 'class-validator';

export function IsBuffer(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isBuffer',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any) {
          return Buffer.isBuffer(value);
        },
        defaultMessage({ value }) {
          return `${value}는 버퍼가 아닙니다.`;
        },
      },
    });
  };
}

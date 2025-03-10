import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { validate, ValidationError } from 'class-validator';
import { RequestDataValidationException } from '../../exception/request-data-validation-exception/request-data-validation-exception';

@Injectable()
export class RequestDataValidationPipe implements PipeTransform {
  async transform(value: any, { metatype, type }: ArgumentMetadata) {
    if (!metatype || !this.toValidate(metatype)) {
      return value;
    }

    const object = plainToInstance(metatype, value);
    const errors: ValidationError[] = await validate(object);

    if (errors.length > 0) {
      throw new RequestDataValidationException({
        validationErrors: errors,
        paramType: type,
      });
    }

    return object;
  }

  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  private toValidate(metatype: Function): boolean {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
    const types: Function[] = [String, Boolean, Number, Array, Object];
    return !types.includes(metatype);
  }
}

import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  PipeTransform,
} from '@nestjs/common';
import { isEthereumAddress } from 'class-validator';

@Injectable()
export class ValidateWalletAddressPipe implements PipeTransform<any, string> {
  transform(value: any, metadata: ArgumentMetadata) {
    if (isEthereumAddress(value)) {
      return value;
    }

    throw new BadRequestException();
  }
}

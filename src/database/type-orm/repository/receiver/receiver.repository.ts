import { Injectable } from '@nestjs/common';
import {
  NotExistDataException,
  UnknownDataBaseException,
} from '@src/core/exception';
import { AbstractRepository } from '..';
import { ReceiverEntity } from '../../entity';
import { TransactionManager } from '../../util/transaction/transaction-manager/transaction-manager';
import { IReceiverRepository } from './receiver.repository.interface';

@Injectable()
export class ReceiverRepository
  extends AbstractRepository<ReceiverEntity>
  implements IReceiverRepository
{
  constructor(protected readonly transactionManager: TransactionManager) {
    super(ReceiverEntity);
  }

  async findPhoneNumberByOrderId(orderId: number) {
    try {
      const receiver = await this.getRepository().findOne({
        select: {
          id: true,
          phone: true,
        },
        where: { id: orderId },
      });

      this.validateNotNull(orderId, receiver);

      return receiver;
    } catch (error) {
      if (error instanceof NotExistDataException) {
        throw error;
      }
      throw new UnknownDataBaseException(error);
    }
  }
}

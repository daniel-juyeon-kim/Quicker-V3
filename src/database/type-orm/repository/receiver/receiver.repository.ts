import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterTypeOrm } from '@nestjs-cls/transactional-adapter-typeorm';
import { Injectable } from '@nestjs/common';
import { UnknownDataBaseException } from '@src/core/module';
import { AbstractRepository } from '..';
import { ReceiverEntity } from '../../entity';
import { NotExistDataException } from '../../util';
import { IReceiverRepository } from './receiver.repository.interface';

@Injectable()
export class ReceiverRepository
  extends AbstractRepository
  implements IReceiverRepository
{
  constructor(
    private readonly txHost: TransactionHost<TransactionalAdapterTypeOrm>,
  ) {
    super();
  }

  async findPhoneNumberByOrderId(orderId: number) {
    try {
      const receiver = await this.txHost.tx
        .getRepository(ReceiverEntity)
        .findOne({
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
        throw new NotExistDataException(
          `${orderId}에 해당되는 데이터가 존재하지 않습니다.`,
        );
      }
      throw new UnknownDataBaseException(error);
    }
  }
}

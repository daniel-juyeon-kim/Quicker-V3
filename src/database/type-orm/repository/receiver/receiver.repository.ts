import { Injectable } from '@nestjs/common';
import { UnknownDataBaseException } from '@src/core/module';
import { EntityManager } from 'typeorm';
import { AbstractRepository } from '..';
import { ReceiverEntity } from '../../entity';
import { NotExistDataException } from '../../util';
import { IReceiverRepository } from './receiver.repository.interface';

@Injectable()
export class ReceiverRepository
  extends AbstractRepository
  implements IReceiverRepository
{
  async findPhoneNumberByOrderId(manager: EntityManager, orderId: number) {
    try {
      const receiver = await manager.findOne(ReceiverEntity, {
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

import { Injectable } from '@nestjs/common';
import { UnknownDataBaseException } from '@src/core/module';
import { OrderEntity } from '../../entity';
import { NotExistDataException } from '../../util';
import { TransactionManager } from '../../util/transaction/transaction-manager/transaction-manager';
import { AbstractRepository } from '../abstract-repository';
import { IOrderParticipantRepository } from './order-participant.repository.interface';

@Injectable()
export class OrderParticipantRepository
  extends AbstractRepository<OrderEntity>
  implements IOrderParticipantRepository
{
  constructor(protected readonly transactionManager: TransactionManager) {
    super(OrderEntity);
  }

  async findSenderReceiverLocationAndPhoneNumberByOrderId(orderId: number) {
    try {
      const order = await this.getRepository().findOne({
        relations: {
          departure: { sender: true },
          destination: { receiver: true },
        },
        where: {
          id: orderId,
        },
        select: {
          id: true,
          departure: {
            id: true,
            x: true,
            y: true,
            sender: { phone: true },
          },
          destination: {
            id: true,
            x: true,
            y: true,
            receiver: { phone: true },
          },
        },
      });

      this.validateNotNull(orderId, order);

      return order;
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

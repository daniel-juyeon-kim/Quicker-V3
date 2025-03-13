import { Injectable } from '@nestjs/common';
import {
  NotExistDataException,
  UnknownDataBaseException,
} from '@src/core/exception';
import { OrderSenderReceiverDto } from '@src/router/order-sender-receiver/dto/order-sender-receiver.dto';
import { plainToInstance } from 'class-transformer';
import { OrderEntity } from '../../entity';
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
            x: true,
            y: true,
            sender: { phone: true },
          },
          destination: {
            x: true,
            y: true,
            receiver: { phone: true },
          },
        },
      });

      this.validateNotNull(orderId, order);

      return plainToInstance(OrderSenderReceiverDto, order);
    } catch (error) {
      if (error instanceof NotExistDataException) {
        throw error;
      }
      throw new UnknownDataBaseException(error);
    }
  }
}

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UnknownDataBaseError } from '@src/core/module';
import { Repository } from 'typeorm';
import { OrderEntity } from '../../entity';
import { NotExistDataError } from '../../util';
import { AbstractRepository } from '../abstract-repository';
import { IOrderParticipantRepository } from './order-participant.repository.interface';

@Injectable()
export class OrderParticipantRepository
  extends AbstractRepository
  implements IOrderParticipantRepository
{
  constructor(
    @InjectRepository(OrderEntity)
    private readonly repository: Repository<OrderEntity>,
  ) {
    super();
  }

  async findSenderReceiverInfoByOrderId(orderId: number) {
    try {
      const order = await this.repository.findOne({
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
      if (error instanceof NotExistDataError) {
        throw new NotExistDataError(
          `${orderId}에 해당되는 데이터가 존재하지 않습니다.`,
        );
      }
      throw new UnknownDataBaseError(error);
    }
  }
}

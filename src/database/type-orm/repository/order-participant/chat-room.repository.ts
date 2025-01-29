import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UnknownDataBaseError } from '@src/core';
import { Repository } from 'typeorm';
import { Order } from '../../entity';
import { NotExistDataError } from '../../util';
import { AbstractRepository } from '../abstract-repository';

@Injectable()
export class OrderParticipantRepository extends AbstractRepository {
  constructor(
    @InjectRepository(Order)
    private readonly repository: Repository<Order>,
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

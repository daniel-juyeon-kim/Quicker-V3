import { Injectable } from '@nestjs/common';
import { UnknownDataBaseException } from '@src/core';
import { OrderDetailDto } from '@src/router/order/dto/order-detail.dto';
import {
  MatchableOrderDto,
  UnmatchedOrderDto,
} from '@src/router/order/dto/unmached-order.dto';
import { plainToInstance } from 'class-transformer';
import { In } from 'typeorm';
import {
  DenormalOrderEntity,
  OrderEntity,
  UnmatchedOrderEntity,
} from '../../entity';
import { TransactionManager } from '../../util/transaction/transaction-manager/transaction-manager';
import { AbstractRepository } from '../abstract-repository';
import { IOrderQueryRepository } from './order-query.repository.interface';

@Injectable()
export class OrderQueryRepository
  extends AbstractRepository<DenormalOrderEntity>
  implements IOrderQueryRepository
{
  constructor(protected readonly transactionManager: TransactionManager) {
    super(DenormalOrderEntity);
  }

  async findAllUnmatchedOrder(
    cursorId: number = 0,
  ): Promise<MatchableOrderDto[]> {
    const PAGE_SIZE = 20;

    try {
      const queryBuilder = this.getManager()
        .createQueryBuilder(UnmatchedOrderEntity, 'order')
        .orderBy('order.id', 'DESC')
        .limit(PAGE_SIZE);

      if (cursorId > 0) {
        queryBuilder.andWhere('order.id < :cursorId', {
          cursorId,
        });
      }

      const matchableOrders = await queryBuilder.getMany();

      return matchableOrders.map((o) => new UnmatchedOrderDto(o));
    } catch (error) {
      throw new UnknownDataBaseException(error);
    }
  }

  async findRequesterIdByOrderId(orderId: number) {
    const order = await this.getManager()
      .createQueryBuilder(DenormalOrderEntity, 'denormal_order')
      .select('requesterId')
      .where('id = :orderId', { orderId })
      .getRawOne<{ requesterId: string }>();

    this.validateNotNull(orderId, order);
    this.validateNotNull(orderId, order.requesterId);

    return order.requesterId;
  }

  async findAllOrderDetailsByIds(orderIds: number[]) {
    try {
      const order = await this.getManager().find(OrderEntity, {
        relations: {
          product: true,
          departure: {
            sender: true,
          },
          destination: {
            receiver: true,
          },
        },
        where: { id: In(orderIds) },
        select: {
          id: true,
          detail: true,
          product: {
            width: true,
            length: true,
            height: true,
            weight: true,
          },
          departure: {
            x: true,
            y: true,
            detail: true,
            sender: {
              name: true,
              phone: true,
            },
          },
          destination: {
            x: true,
            y: true,
            detail: true,
            receiver: {
              name: true,
              phone: true,
            },
          },
        },
      });

      return plainToInstance(OrderDetailDto, order);
    } catch (error) {
      throw new UnknownDataBaseException(error);
    }
  }
}

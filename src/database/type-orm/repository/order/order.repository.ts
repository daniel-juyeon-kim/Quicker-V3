import { Injectable } from '@nestjs/common';
import {
  BusinessRuleConflictDataException,
  NotExistDataException,
  UnknownDataBaseException,
} from '@src/core/exception';
import { MatchableOrderDto } from '@src/router/order/dto/matchable-order.dto';
import { OrderDetailDto } from '@src/router/order/dto/order-detail.dto';
import { plainToInstance } from 'class-transformer';
import { In } from 'typeorm';
import {
  DepartureEntity,
  DestinationEntity,
  OrderEntity,
  ProductEntity,
  ReceiverEntity,
  SenderEntity,
  TransportationEntity,
  UserEntity,
} from '../..';
import { Transactional } from '../../util/transaction/decorator/transactional.decorator';
import { TransactionManager } from '../../util/transaction/transaction-manager/transaction-manager';
import { AbstractRepository } from '../abstract-repository';
import { IOrderRepository } from './order.repository.interface';

@Injectable()
export class OrderRepository
  extends AbstractRepository<OrderEntity>
  implements IOrderRepository
{
  constructor(protected readonly transactionManager: TransactionManager) {
    super(OrderEntity);
  }

  async updateDeliveryPersonAtOrder({
    orderId,
    walletAddress,
  }: {
    orderId: number;
    walletAddress: string;
  }) {
    try {
      const deliverPerson = await this.getManager().findOneBy(UserEntity, {
        walletAddress,
      });

      this.validateNotNull(walletAddress, deliverPerson);

      const order = await this.getManager().findOne(OrderEntity, {
        relations: { requester: true },
        select: {
          requester: { walletAddress: true },
        },
        where: { id: orderId },
      });

      this.validateNotNull(walletAddress, order);

      if (deliverPerson.walletAddress === order.requester.walletAddress) {
        throw new BusinessRuleConflictDataException(walletAddress);
      }

      await this.getManager().update(
        OrderEntity,
        { id: orderId },
        { deliveryPerson: deliverPerson },
      );
    } catch (error) {
      if (error instanceof NotExistDataException) {
        throw error;
      } else if (error instanceof BusinessRuleConflictDataException) {
        throw error;
      }
      throw new UnknownDataBaseException(error);
    }
  }

  @Transactional()
  async createOrder({
    walletAddress,
    detail,
    receiver,
    destination,
    sender,
    departure,
    product,
    transportation,
  }: Parameters<IOrderRepository['createOrder']>[0]) {
    try {
      const requester = await this.getManager().findOneBy(UserEntity, {
        walletAddress,
      });

      this.validateNotNull(walletAddress, requester);

      const order = this.getManager().create(OrderEntity, {
        detail,
        requester,
      });

      await this.getManager().insert(OrderEntity, order);

      const id = order.id;

      await this.getManager().insert(ProductEntity, {
        id,
        ...product,
      });
      await this.getManager().insert(TransportationEntity, {
        id,
        ...transportation,
      });
      await this.getManager().insert(DestinationEntity, {
        id,
        ...destination,
      });
      await this.getManager().insert(ReceiverEntity, {
        id,
        ...receiver,
      });
      await this.getManager().insert(DepartureEntity, {
        id,
        ...departure,
      });
      await this.getManager().insert(SenderEntity, {
        id,
        ...sender,
      });
    } catch (error) {
      if (error instanceof NotExistDataException) {
        throw error;
      }
      throw new UnknownDataBaseException(error);
    }
  }

  async findRequesterIdByOrderId(orderId: number) {
    try {
      const requester = await this.getRepository().findOne({
        relations: {
          requester: true,
          deliveryPerson: true,
        },
        where: { id: orderId },
        select: {
          id: true,
          requester: { id: true },
          deliveryPerson: { id: true },
        },
      });

      this.validateNotNull(orderId, requester);

      return requester;
    } catch (error) {
      if (error instanceof NotExistDataException) {
        throw error;
      }
      throw new UnknownDataBaseException(error);
    }
  }

  @Transactional()
  async findAllMatchableOrderByWalletAddress(
    deliverPersonWalletAddress: string,
  ) {
    try {
      const deliveryPerson = await this.getManager().findOne(UserEntity, {
        select: { id: true },
        where: { walletAddress: deliverPersonWalletAddress },
      });

      if (!deliveryPerson) {
        throw new NotExistDataException(deliverPersonWalletAddress);
      }

      const matchableOrders = await this.getManager()
        .createQueryBuilder(OrderEntity, 'order')
        .where('order.requesterId != :deliveryPersonId', {
          deliveryPersonId: deliveryPerson.id,
        })
        .andWhere('order.deliveryPersonId is null')
        .leftJoin('order.product', 'product')
        .addSelect([
          'product.width',
          'product.length',
          'product.height',
          'product.weight',
        ])
        .leftJoin('order.transportation', 'transportation')
        .addSelect([
          'transportation.walking',
          'transportation.bicycle',
          'transportation.scooter',
          'transportation.bike',
          'transportation.car',
          'transportation.truck',
        ])
        .leftJoin('order.destination', 'destination')
        .addSelect(['destination.x', 'destination.y', 'destination.detail'])
        .leftJoin('order.departure', 'departure')
        .addSelect(['departure.x', 'departure.y', 'departure.detail'])
        .getMany();

      return plainToInstance(MatchableOrderDto, matchableOrders);
    } catch (error) {
      if (error instanceof NotExistDataException) {
        throw error;
      }
      throw new UnknownDataBaseException(error);
    }
  }

  async findAllCreatedOrDeliveredOrderDetailByOrderIds(orderIds: number[]) {
    try {
      const order = await this.getRepository().find({
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

  async deleteByOrderId(orderId: number) {
    try {
      await this.getRepository().delete(orderId);
    } catch (error) {
      throw new UnknownDataBaseException(error);
    }
  }
}

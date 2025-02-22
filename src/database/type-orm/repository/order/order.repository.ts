import { Transactional, TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterTypeOrm } from '@nestjs-cls/transactional-adapter-typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UnknownDataBaseException } from '@src/core/module';
import { isNull } from '@src/core/util';
import { In, IsNull, Not, Repository } from 'typeorm';
import {
  BusinessRuleConflictDataException,
  DepartureEntity,
  DestinationEntity,
  NotExistDataException,
  OrderEntity,
  ProductEntity,
  ReceiverEntity,
  SenderEntity,
  TransportationEntity,
  UserEntity,
} from '../..';
import { AbstractRepository } from '../abstract-repository';
import { IOrderRepository } from './order.repository.interface';

@Injectable()
export class OrderRepository
  extends AbstractRepository
  implements IOrderRepository
{
  constructor(
    private readonly txHost: TransactionHost<TransactionalAdapterTypeOrm>,
    @InjectRepository(OrderEntity)
    private readonly repository: Repository<OrderEntity>,
  ) {
    super();
  }

  async updateDeliveryPersonAtOrder({
    orderId,
    walletAddress,
  }: {
    orderId: number;
    walletAddress: string;
  }) {
    try {
      const deliverPerson = await this.txHost.tx
        .getRepository(UserEntity)
        .findOneBy({
          walletAddress,
        });

      if (isNull(deliverPerson)) {
        throw new NotExistDataException(
          `${walletAddress} 에 대응되는 사용자가 존재하지 않습니다.`,
        );
      }

      const order = await this.txHost.tx.getRepository(OrderEntity).findOne({
        relations: { requester: true },
        select: {
          requester: { walletAddress: true },
        },
        where: { id: orderId },
      });

      if (isNull(order)) {
        throw new NotExistDataException(
          `${orderId} 에 대응되는 주문이 존재하지 않습니다.`,
        );
      }

      if (deliverPerson.walletAddress === order.requester.walletAddress) {
        throw new BusinessRuleConflictDataException(
          `${walletAddress}가 의뢰인의 지갑주소와 동일합니다.`,
        );
      }

      await this.txHost.tx
        .getRepository(OrderEntity)
        .update({ id: orderId }, { deliveryPerson: deliverPerson });
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
      const requester = await this.manager.findOneBy(UserEntity, {
        walletAddress,
      });

      this.validateNotNull(walletAddress, requester);

      const order = this.manager.create(OrderEntity, {
        detail,
        requester,
      });

      await this.manager.insert(OrderEntity, order);

      const id = order.id;

      await this.manager.insert(ProductEntity, {
        id,
        ...product,
      });
      await this.manager.insert(TransportationEntity, {
        id,
        ...transportation,
      });
      await this.manager.insert(DestinationEntity, {
        id,
        ...destination,
      });
      await this.manager.insert(ReceiverEntity, {
        id,
        ...receiver,
      });
      await this.manager.insert(DepartureEntity, {
        id,
        ...departure,
      });
      await this.manager.insert(SenderEntity, {
        id,
        ...sender,
      });
    } catch (error) {
      if (error instanceof NotExistDataException) {
        throw new NotExistDataException(
          `${walletAddress}에 해당되는 사용자를 찾지 못했습니다.`,
        );
      }
      throw new UnknownDataBaseException(error);
    }
  }

  async findRequesterIdByOrderId(orderId: number) {
    try {
      const requester = await this.repository.findOne({
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

  async findAllMatchableOrderByWalletAddress(
    deliverPersonWalletAddress: string,
  ) {
    try {
      return await this.repository.manager.transaction(async (manager) => {
        const isExistUser = await manager.exists(UserEntity, {
          where: { walletAddress: deliverPersonWalletAddress },
        });

        if (!isExistUser) {
          throw new NotExistDataException(
            `${deliverPersonWalletAddress}에 해당하는 사용자가 존재하지 않습니다.`,
          );
        }

        return await manager.find(OrderEntity, {
          relations: {
            product: true,
            transportation: true,
            destination: true,
            departure: true,
          },
          where: {
            requester: { walletAddress: Not(deliverPersonWalletAddress) },
            deliveryPerson: { walletAddress: IsNull() },
          },
          select: {
            id: true,
            detail: true,
            product: {
              width: true,
              length: true,
              height: true,
              weight: true,
            },
            transportation: {
              walking: true,
              bicycle: true,
              scooter: true,
              bike: true,
              car: true,
              truck: true,
            },
            destination: {
              x: true,
              y: true,
              detail: true,
            },
            departure: {
              x: true,
              y: true,
              detail: true,
            },
          },
        });
      });
    } catch (error) {
      if (error instanceof NotExistDataException) {
        throw new NotExistDataException(
          `${deliverPersonWalletAddress}에 해당하는 사용자가 존재하지 않습니다.`,
        );
      }
      throw new UnknownDataBaseException(error);
    }
  }

  async findAllCreatedOrDeliveredOrderDetailByOrderIds(orderIds: number[]) {
    try {
      const order = await this.repository.find({
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

      return order;
    } catch (error) {
      throw new UnknownDataBaseException(error);
    }
  }

  async deleteByOrderId(orderId: number) {
    try {
      await this.repository.delete(orderId);
    } catch (error) {
      throw new UnknownDataBaseException(error);
    }
  }
}

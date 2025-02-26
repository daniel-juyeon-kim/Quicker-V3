import { Injectable } from '@nestjs/common';
import { UnknownDataBaseException } from '@src/core/module';
import { isNull } from '@src/core/util';
import { In, IsNull, Not } from 'typeorm';
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

      if (isNull(deliverPerson)) {
        throw new NotExistDataException(
          `${walletAddress} 에 대응되는 사용자가 존재하지 않습니다.`,
        );
      }

      const order = await this.getManager().findOne(OrderEntity, {
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
        throw new NotExistDataException(
          `${walletAddress}에 해당되는 사용자를 찾지 못했습니다.`,
        );
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

  async findAllMatchableOrderByWalletAddress(
    deliverPersonWalletAddress: string,
  ) {
    try {
      return await this.getManager().transaction(async (manager) => {
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

      return order;
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

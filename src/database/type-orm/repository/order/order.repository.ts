import { Injectable } from '@nestjs/common';
import {
  NotExistDataException,
  UnknownDataBaseException,
} from '@src/core/exception';
import {
  DenormalOrderEntity,
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
  extends AbstractRepository<DenormalOrderEntity>
  implements IOrderRepository
{
  constructor(protected readonly transactionManager: TransactionManager) {
    super(DenormalOrderEntity);
  }

  async updateDeliveryPersonId({
    orderId,
    deliveryPersonId,
  }: {
    orderId: number;
    deliveryPersonId: string;
  }) {
    try {
      await this.getRepository().update(
        { id: orderId },
        { deliveryPerson: { id: deliveryPersonId } },
      );
    } catch (error) {
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
}

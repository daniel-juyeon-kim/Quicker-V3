import { EntityManager } from 'typeorm';
import { ReceiverEntity } from '../../entity';

export interface IReceiverRepository {
  findPhoneNumberByOrderId(
    manager: EntityManager,
    orderId: number,
  ): Promise<ReceiverEntity>;
}

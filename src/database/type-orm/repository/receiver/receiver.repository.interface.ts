import { ReceiverEntity } from '../../entity';

export interface IReceiverRepository {
  findPhoneNumberByOrderId(orderId: number): Promise<ReceiverEntity>;
}

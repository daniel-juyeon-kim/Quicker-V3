import { Inject, Injectable } from '@nestjs/common';
import { RepositoryToken } from '@src/core/constant';
import { IOrderParticipantRepository } from '@src/database/type-orm/repository/order-participant/order-participant.repository.interface';
import { IOrderSenderReceiverService } from './order-sender-receiver.service.interface';

@Injectable()
export class OrderSenderReceiverService implements IOrderSenderReceiverService {
  constructor(
    @Inject(RepositoryToken.ORDER_PARTICIPANT_REPOSITORY)
    private readonly orderParticipantRepository: IOrderParticipantRepository,
  ) {}

  async findSenderReceiverLocationAndPhoneNumberByOrderId(orderId: number) {
    return await this.orderParticipantRepository.findSenderReceiverLocationAndPhoneNumberByOrderId(
      orderId,
    );
  }
}

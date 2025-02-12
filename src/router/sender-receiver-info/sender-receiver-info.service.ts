import { Inject, Injectable } from '@nestjs/common';
import { RepositoryToken } from '@src/core/constant';
import { ISenderReceiverInfoService } from './sender-receiver-info.service.interface';
import { IOrderParticipantRepository } from '@src/database/type-orm/repository/order-participant/order-participant.repository.interface';

@Injectable()
export class SenderReceiverInfoService implements ISenderReceiverInfoService {
  constructor(
    @Inject(RepositoryToken.ORDER_PARTICIPANT_REPOSITORY)
    private readonly repository: IOrderParticipantRepository,
  ) {}

  async findSenderReceiverInfo(orderId: number) {
    return await this.repository.findSenderReceiverInfoByOrderId(orderId);
  }
}

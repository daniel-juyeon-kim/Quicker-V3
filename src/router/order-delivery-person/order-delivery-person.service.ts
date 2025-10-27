import { Inject, Injectable } from '@nestjs/common';
import { BusinessRuleConflictDataException } from '@src/core';
import { RepositoryToken } from '@src/core/constant';
import { DeliveryUrlCreator, NaverSmsApi } from '@src/core/module';
import { IOrderRepository, IUserRepository } from '@src/database';
import { ICurrentDeliveryLocationRepository } from '@src/database/mongoose/repository/current-delivery-location/current-delivery-location.repository.interface';
import { IDeliveryPersonMatchedDateRepository } from '@src/database/type-orm/repository/delivery-person-matched-date/delivery-person-matched-date.repository.interface';
import { IOrderQueryRepository } from '@src/database/type-orm/repository/order/order-query.repository.interface';
import { IReceiverRepository } from '@src/database/type-orm/repository/receiver/receiver.repository.interface';
import { Transactional } from '@src/database/type-orm/util/transaction/decorator/transactional.decorator';
import { IOrderDeliveryPersonService } from './order-delivery-person.service.interface';

@Injectable()
export class OrderDeliveryPersonService implements IOrderDeliveryPersonService {
  @Inject(RepositoryToken.ORDER_REPOSITORY)
  private readonly orderRepository: IOrderRepository;
  @Inject(RepositoryToken.RECEIVER_REPOSITORY)
  private readonly receiverRepository: IReceiverRepository;
  @Inject(RepositoryToken.DELIVERY_PERSON_MATCHED_DATE_REPOSITORY)
  private readonly deliveryPersonMatchedDateRepository: IDeliveryPersonMatchedDateRepository;
  @Inject(RepositoryToken.CURRENT_DELIVERY_LOCATION_REPOSITORY)
  private readonly currentDeliveryLocationRepository: ICurrentDeliveryLocationRepository;
  @Inject(RepositoryToken.USER_REPOSITORY)
  private readonly userRepository: IUserRepository;
  @Inject(RepositoryToken.ORDER_QUERY_REPOSITORY)
  private readonly orderQueryRepository: IOrderQueryRepository;

  constructor(
    private readonly deliveryUrlCreator: DeliveryUrlCreator,
    private readonly smsApi: NaverSmsApi,
  ) {}

  async findCurrentLocationByOrderId(orderId: number) {
    return await this.currentDeliveryLocationRepository.findCurrentLocationByOrderId(
      orderId,
    );
  }

  async createCurrentLocation({
    orderId,
    x,
    y,
  }: {
    x: number;
    y: number;
    orderId: number;
  }) {
    await this.currentDeliveryLocationRepository.saveDeliveryPersonLocation(
      orderId,
      { x, y },
    );
  }

  @Transactional()
  async matchDeliveryPerson({
    orderId,
    walletAddress,
  }: {
    orderId: number;
    walletAddress: string;
  }) {
    // 배송원의 지갑 주소로 배송원의 아이디 조회
    const deliveryPersonId =
      await this.userRepository.findIdByWalletAddress(walletAddress);

    // 의뢰 아이디로 의뢰인의 아이디 조회
    const requesterId =
      await this.orderQueryRepository.findRequesterIdByOrderId(orderId);

    // 의뢰인과 배송원의 아이디는 일치하면 안됨
    if (deliveryPersonId === requesterId) {
      throw new BusinessRuleConflictDataException(walletAddress);
    }

    // 의뢰테이블에 배송원 아이디 업데이트
    await this.orderRepository.updateDeliveryPersonId({
      orderId,
      deliveryPersonId,
    });

    await this.deliveryPersonMatchedDateRepository.create(orderId);

    // 의뢰 아이디로 수취인의 전화번호 조회
    const receiver =
      await this.receiverRepository.findPhoneNumberByOrderId(orderId);

    // 수취인에게 보낼 URL 생성
    const url = this.deliveryUrlCreator.createUrl({ orderId, walletAddress });

    // 수취인에게 메시지 발송
    await this.smsApi.sendDeliveryTrackingMessage(url, receiver.phone);
  }
}

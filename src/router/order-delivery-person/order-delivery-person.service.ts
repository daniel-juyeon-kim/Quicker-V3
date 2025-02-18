import { Inject, Injectable } from '@nestjs/common';
import { RepositoryToken } from '@src/core/constant';
import { DeliveryUrlCreator, NaverSmsApi } from '@src/core/module';
import { IOrderRepository } from '@src/database';
import { ICurrentDeliveryLocationRepository } from '@src/database/mongoose/repository/current-delivery-location/current-delivery-location.repository.interface';
import { IDeliveryPersonMatchedDateRepository } from '@src/database/type-orm/repository/delivery-person-matched-date/delivery-person-matched-date.repository.interface';
import { IReceiverRepository } from '@src/database/type-orm/repository/receiver/receiver.repository.interface';
import { DataSource } from 'typeorm';
import { IOrderDeliveryPersonService } from './order-delivery-person.service.interface';

@Injectable()
export class OrderDeliveryPersonService implements IOrderDeliveryPersonService {
  constructor(
    private readonly dataSource: DataSource,
    @Inject(RepositoryToken.ORDER_REPOSITORY)
    private readonly orderRepository: IOrderRepository,
    @Inject(RepositoryToken.RECEIVER_REPOSITORY)
    private readonly receiverRepository: IReceiverRepository,
    @Inject(RepositoryToken.DELIVERY_PERSON_MATCHED_DATE_REPOSITORY)
    private readonly deliveryPersonMatchedDateRepository: IDeliveryPersonMatchedDateRepository,
    @Inject(RepositoryToken.CURRENT_DELIVERY_LOCATION_REPOSITORY)
    private readonly currentDeliveryLocationRepository: ICurrentDeliveryLocationRepository,
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

  async matchDeliveryPersonAtOrder({
    orderId,
    walletAddress,
  }: {
    orderId: number;
    walletAddress: string;
  }) {
    await this.dataSource.transaction(async (manager) => {
      await this.orderRepository.updateDeliveryPersonAtOrder(manager, {
        orderId,
        walletAddress,
      });

      await this.deliveryPersonMatchedDateRepository.create(manager, orderId);

      const receiver = await this.receiverRepository.findPhoneNumberByOrderId(
        manager,
        orderId,
      );

      // 1. 주문아이디와 배송원 지갑주소를 암호화하고 url 링크를 클라이언트에게 메시지로 전달(클라이언트 키를 통해 복호화 할 수 있도록함)
      // 2. 클라이언트 복호화 키를 통해 암호화된 url을 복호화, 해당 데이터로 배송원의 현재위치등을 조회
      const url = this.deliveryUrlCreator.createUrl({ orderId, walletAddress });

      await this.smsApi.sendDeliveryTrackingMessage(url, receiver.phone);
    });
  }
}

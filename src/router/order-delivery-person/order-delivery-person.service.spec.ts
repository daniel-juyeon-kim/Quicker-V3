import { Test, TestingModule } from '@nestjs/testing';
import { RepositoryToken } from '@src/core/constant';
import {
  BusinessRuleConflictDataException,
  NotExistDataException,
  SmsApiException,
  UnknownDataBaseException,
} from '@src/core/exception';
import { DeliveryUrlCreator, NaverSmsApi } from '@src/core/module';
import { NaverSmsApiResponse } from '@src/core/module/external-api/sms-api/naver-sms-api.response';
import {
  IOrderRepository,
  IUserRepository,
  ReceiverEntity,
} from '@src/database';
import { ICurrentDeliveryLocationRepository } from '@src/database/mongoose/repository/current-delivery-location/current-delivery-location.repository.interface';
import { IDeliveryPersonMatchedDateRepository } from '@src/database/type-orm/repository/delivery-person-matched-date/delivery-person-matched-date.repository.interface';
import { IOrderQueryRepository } from '@src/database/type-orm/repository/order/order-query.repository.interface';
import { IReceiverRepository } from '@src/database/type-orm/repository/receiver/receiver.repository.interface';
import { mock, mockClear } from 'jest-mock-extended';
import { OrderDeliveryPersonService } from './order-delivery-person.service';

jest.mock(
  '@src/database/type-orm/util/transaction/decorator/transactional.decorator',
  () => ({
    Transactional:
      () =>
      (target: any, propertyKey: string, descriptor: PropertyDescriptor) =>
        descriptor,
  }),
);

describe('OrderDeliveryPersonService', () => {
  let service: OrderDeliveryPersonService;

  const orderRepository = mock<IOrderRepository>();
  const receiverRepository = mock<IReceiverRepository>();
  const currentDeliveryLocationRepository =
    mock<ICurrentDeliveryLocationRepository>();
  const deliveryPersonMatchedDateRepository =
    mock<IDeliveryPersonMatchedDateRepository>();
  const userRepository = mock<IUserRepository>();
  const orderQueryRepository = mock<IOrderQueryRepository>();
  const deliveryUrlCreator = mock<DeliveryUrlCreator>();
  const smsApi = mock<NaverSmsApi>();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrderDeliveryPersonService,
        {
          provide: RepositoryToken.ORDER_REPOSITORY,
          useValue: orderRepository,
        },
        {
          provide: RepositoryToken.RECEIVER_REPOSITORY,
          useValue: receiverRepository,
        },
        {
          provide: RepositoryToken.DELIVERY_PERSON_MATCHED_DATE_REPOSITORY,
          useValue: deliveryPersonMatchedDateRepository,
        },
        {
          provide: RepositoryToken.CURRENT_DELIVERY_LOCATION_REPOSITORY,
          useValue: currentDeliveryLocationRepository,
        },
        { provide: RepositoryToken.USER_REPOSITORY, useValue: userRepository },
        {
          provide: RepositoryToken.ORDER_QUERY_REPOSITORY,
          useValue: orderQueryRepository,
        },
        { provide: DeliveryUrlCreator, useValue: deliveryUrlCreator },
        { provide: NaverSmsApi, useValue: smsApi },
      ],
    }).compile();

    service = module.get<OrderDeliveryPersonService>(
      OrderDeliveryPersonService,
    );

    mockClear(orderRepository);
    mockClear(receiverRepository);
    mockClear(deliveryPersonMatchedDateRepository);
    mockClear(currentDeliveryLocationRepository);
    mockClear(userRepository);
    mockClear(orderQueryRepository);
    mockClear(deliveryUrlCreator);
    mockClear(smsApi);
  });

  describe('findCurrentLocationByOrderId', () => {
    it('통과하는 테스트: 주문 ID로 배송원의 현재 위치를 성공적으로 조회한다', async () => {
      const orderId = 1;
      await service.findCurrentLocationByOrderId(orderId);
      expect(
        currentDeliveryLocationRepository.findCurrentLocationByOrderId,
      ).toHaveBeenCalledWith(orderId);
    });

    it('실패하는 테스트: 존재하지 않는 주문 ID로 조회 시 NotExistDataException을 던진다', async () => {
      const orderId = 1;
      const error = new NotExistDataException(orderId);
      currentDeliveryLocationRepository.findCurrentLocationByOrderId.mockRejectedValueOnce(
        error,
      );
      await expect(
        service.findCurrentLocationByOrderId(orderId),
      ).rejects.toThrow(error);
    });
  });

  describe('createCurrentLocation', () => {
    it('통과하는 테스트: 배송원의 현재 위치를 성공적으로 저장한다', async () => {
      const orderId = 1;
      const location = { x: 128.25424, y: 35.95234 };
      const dto = { orderId, ...location };
      await service.createCurrentLocation(dto);
      expect(
        currentDeliveryLocationRepository.saveDeliveryPersonLocation,
      ).toHaveBeenCalledWith(orderId, location);
    });

    it('실패하는 테스트: DB 저장 실패 시 UnknownDataBaseException을 던진다', async () => {
      const dto = { orderId: 1, x: 128.25424, y: 35.95234 };
      const error = new UnknownDataBaseException(new Error('DB Error'));
      currentDeliveryLocationRepository.saveDeliveryPersonLocation.mockRejectedValueOnce(
        error,
      );
      await expect(service.createCurrentLocation(dto)).rejects.toThrow(error);
    });
  });

  describe('matchDeliveryPerson', () => {
    const orderId = 1;
    const walletAddress = 'delivery-person-wallet-address';
    const deliveryPersonId = 'delivery-person-id';
    const requesterId = 'requester-id';
    const receiverPhone = '01012345678';
    const deliveryUrl = 'http://some.url/delivery';

    it('통과하는 테스트: 성공적으로 배송원을 매칭하고 수취인에게 알림을 보낸다', async () => {
      userRepository.findIdByWalletAddress.mockResolvedValue(deliveryPersonId);
      orderQueryRepository.findRequesterIdByOrderId.mockResolvedValue(
        requesterId,
      );
      receiverRepository.findPhoneNumberByOrderId.mockResolvedValue({
        phone: receiverPhone,
      } as ReceiverEntity);
      deliveryUrlCreator.createUrl.mockReturnValue(deliveryUrl);

      await service.matchDeliveryPerson({ orderId, walletAddress });

      expect(userRepository.findIdByWalletAddress).toHaveBeenCalledWith(
        walletAddress,
      );
      expect(
        orderQueryRepository.findRequesterIdByOrderId,
      ).toHaveBeenCalledWith(orderId);
      expect(orderRepository.updateDeliveryPersonId).toHaveBeenCalledWith({
        orderId,
        deliveryPersonId,
      });
      expect(deliveryPersonMatchedDateRepository.create).toHaveBeenCalledWith(
        orderId,
      );
      expect(receiverRepository.findPhoneNumberByOrderId).toHaveBeenCalledWith(
        orderId,
      );
      expect(deliveryUrlCreator.createUrl).toHaveBeenCalledWith({
        orderId,
        walletAddress,
      });
      expect(smsApi.sendDeliveryTrackingMessage).toHaveBeenCalledWith(
        deliveryUrl,
        receiverPhone,
      );
    });

    it('실패하는 테스트: 의뢰인과 배송원이 동일 인물이면 BusinessRuleConflictDataException을 던진다', async () => {
      userRepository.findIdByWalletAddress.mockResolvedValue(deliveryPersonId);
      orderQueryRepository.findRequesterIdByOrderId.mockResolvedValue(
        deliveryPersonId,
      );

      await expect(
        service.matchDeliveryPerson({ orderId, walletAddress }),
      ).rejects.toThrow(BusinessRuleConflictDataException);
      expect(orderRepository.updateDeliveryPersonId).not.toHaveBeenCalled();
      expect(smsApi.sendDeliveryTrackingMessage).not.toHaveBeenCalled();
    });

    it('실패하는 테스트: 존재하지 않는 배송원 지갑 주소일 경우 NotExistDataException을 던진다', async () => {
      const error = new NotExistDataException(walletAddress);
      userRepository.findIdByWalletAddress.mockRejectedValue(error);

      await expect(
        service.matchDeliveryPerson({ orderId, walletAddress }),
      ).rejects.toThrow(error);
      expect(
        orderQueryRepository.findRequesterIdByOrderId,
      ).not.toHaveBeenCalled();
    });

    it('실패하는 테스트: 존재하지 않는 주문 ID일 경우 NotExistDataException을 던진다', async () => {
      const error = new NotExistDataException(orderId);
      userRepository.findIdByWalletAddress.mockResolvedValue(deliveryPersonId);
      orderQueryRepository.findRequesterIdByOrderId.mockRejectedValue(error);

      await expect(
        service.matchDeliveryPerson({ orderId, walletAddress }),
      ).rejects.toThrow(error);
      expect(orderRepository.updateDeliveryPersonId).not.toHaveBeenCalled();
    });

    it('실패하는 테스트: SMS API 호출 실패 시 SmsApiException을 던진다', async () => {
      const smsError = new SmsApiException({} as NaverSmsApiResponse);
      userRepository.findIdByWalletAddress.mockResolvedValue(deliveryPersonId);
      orderQueryRepository.findRequesterIdByOrderId.mockResolvedValue(
        requesterId,
      );
      receiverRepository.findPhoneNumberByOrderId.mockResolvedValue({
        phone: receiverPhone,
      } as ReceiverEntity);
      deliveryUrlCreator.createUrl.mockReturnValue(deliveryUrl);
      smsApi.sendDeliveryTrackingMessage.mockRejectedValue(smsError);

      await expect(
        service.matchDeliveryPerson({ orderId, walletAddress }),
      ).rejects.toThrow(smsError);
      expect(orderRepository.updateDeliveryPersonId).toHaveBeenCalled();
      expect(deliveryPersonMatchedDateRepository.create).toHaveBeenCalled();
    });
  });
});

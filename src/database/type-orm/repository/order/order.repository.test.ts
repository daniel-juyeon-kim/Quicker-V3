import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ENTITY_MANAGER_KEY } from '@src/core/constant';
import { ClsModule, ClsService, ClsServiceManager } from 'nestjs-cls';
import { afterEach } from 'node:test';
import { EntityManager } from 'typeorm';
import { DenormalOrderBuilder } from '../../../../../test/builder/denormal-order.builder';
import { UserBuilder } from '../../../../../test/builder/user.builder';
import { TestTypeormModule } from '../../../../../test/config/typeorm.module';
import {
  DenormalOrderEntity,
  DepartureEntity,
  DestinationEntity,
  OrderEntity,
  OrderParticipantEntity,
  ProductEntity,
  TransportationEntity,
  UserEntity,
} from '../../entity';
import { TransactionManager } from '../../util/transaction/transaction-manager/transaction-manager';
import { OrderRepository } from './order.repository';

describe('OrderRepository', () => {
  let testModule: TestingModule;
  let repository: OrderRepository;
  let manager: EntityManager;
  let cls: ClsService<{ [ENTITY_MANAGER_KEY]: EntityManager }>;

  beforeEach(async () => {
    testModule = await Test.createTestingModule({
      imports: [
        TestTypeormModule,
        TypeOrmModule.forFeature([
          OrderEntity,
          UserEntity,
          ProductEntity,
          DenormalOrderEntity,
          OrderParticipantEntity,
          TransportationEntity,
          DestinationEntity,
          DepartureEntity,
          ClsModule,
        ]),
      ],
      providers: [OrderRepository, TransactionManager],
    }).compile();

    repository = testModule.get(OrderRepository);
    manager = testModule.get(EntityManager);
    cls = ClsServiceManager.getClsService();
  });

  describe('createOrder', () => {
    const WALLET_ADDRESS = '지갑주소';

    beforeEach(async () => {
      await manager.save(
        UserEntity,
        new UserBuilder()
          .withId('1')
          .withWalletAddress(WALLET_ADDRESS)
          .withContact('01012341234')
          .withName('이름')
          .withEmail('이메일')
          .build(),
      );
    });

    afterEach(async () => {
      await manager.clear(UserEntity);
      await manager.clear(OrderEntity);
    });

    test('통과하는 테스트', async () => {
      const detail = '디테일';
      const product = {
        width: 0,
        length: 0,
        height: 0,
        weight: 0,
      };
      const transportation = {
        bicycle: 1,
        car: 0,
        truck: 0,
        walking: 0,
        scooter: 0,
        bike: 1,
      } as const;
      const destination = {
        x: 37.5,
        y: 112,
        detail: '디테일',
      };
      const receiver = {
        name: '이름',
        phone: '01012345678',
      };
      const departure = {
        x: 0,
        y: 0,
        detail: '디테일',
      };
      const sender = {
        name: '이름',
        phone: '01012345678',
      };
      const dto = {
        walletAddress: WALLET_ADDRESS,
        detail,
        receiver,
        destination,
        sender,
        departure,
        product,
        transportation,
      };

      const user = await manager.findOneBy(UserEntity, {
        walletAddress: WALLET_ADDRESS,
      });
      const result = {
        id: 1,
        requester: user,
        detail: '디테일',
        departure: {
          id: 1,
          ...departure,
          sender: { id: 1, ...sender },
        },
        destination: {
          id: 1,
          ...destination,
          receiver: { id: 1, ...receiver },
        },
        product: { id: 1, ...product },
        transportation: {
          id: 1,
          ...{
            bike: 0,
            car: 0,
            scooter: 0,
            truck: 0,
            walking: 0,
          },
          ...transportation,
        },
      };

      await cls.run(async () => {
        cls.set(ENTITY_MANAGER_KEY, manager);
        await repository.createOrder(dto);
      });

      await expect(
        manager.findOne(OrderEntity, {
          relations: {
            destination: { receiver: true },
            departure: { sender: true },
            requester: true,
            product: true,
            transportation: true,
          },
          where: { requester: user },
        }),
      ).resolves.toEqual(result);
    });
  });

  describe('updateDeliveryPersonAtOrder', () => {
    const requesterId = '의뢰인 아이디';
    const deliveryPersonId = '배송원 아이디';

    beforeEach(async () => {
      const requester = await manager.save(
        UserEntity,
        new UserBuilder()
          .withId(requesterId)
          .withWalletAddress('의뢰인 지갑 주소')
          .withContact('의뢰인 연락처')
          .withName('이름')
          .withEmail('이메일')
          .build(),
      );
      const deliveryPerson = new UserBuilder()
        .withId(deliveryPersonId)
        .withWalletAddress('배송원 지갑 주소')
        .withContact('배송원 연락처')
        .withName('이름')
        .withEmail('이메일')
        .build();

      const orderId = 1;
      const participant = new OrderParticipantEntity();
      Object.assign(participant, {
        id: orderId,
        senderName: '이름',
        senderPhone: '01012345678',
        receiverName: '이름',
        receiverPhone: '01012345678',
      });

      await manager.save(
        DenormalOrderEntity,
        new DenormalOrderBuilder()
          .withId(orderId)
          .withRequester(requester)
          .withDeliveryPerson(null)
          .withDetail('디테일')
          .withProduct({ width: 0, length: 0, height: 0, weight: 0 })
          .withTransportation({
            walking: 0,
            bicycle: 1,
            scooter: 0,
            bike: 1,
            car: 0,
            truck: 1,
          })
          .withDestination({ x: 37.5, y: 112, detail: '디테일' })
          .withDeparture({ x: 0, y: 0, detail: '디테일' })
          .withParticipant(participant)
          .build(),
      );
      await manager.save(UserEntity, deliveryPerson);
    });

    afterEach(async () => {
      await manager.clear(OrderEntity);
      await manager.clear(UserEntity);
    });

    test('통과하는 테스트', async () => {
      const dto = {
        deliveryPersonId,
        orderId: 1,
      };
      const result = {
        deliveryPerson: {
          contact: '배송원 연락처',
          email: '이메일',
          id: '배송원 아이디',
          name: '이름',
          walletAddress: '배송원 지갑 주소',
        },
        requester: {
          contact: '의뢰인 연락처',
          email: '이메일',
          id: '의뢰인 아이디',
          name: '이름',
          walletAddress: '의뢰인 지갑 주소',
        },
        bicycle: 1,
        bike: 1,
        car: 0,
        deliveryPersonMatchedDate: null,
        departureDetail: '디테일',
        departureX: 0,
        departureY: 0,
        destinationDetail: '디테일',
        destinationX: 37.5,
        destinationY: 112,
        detail: '디테일',
        height: 0,
        id: 1,
        length: 0,
        scooter: 0,
        truck: 1,
        walking: 0,
        weight: 0,
        width: 0,
      };

      await cls.run(async () => {
        cls.set(ENTITY_MANAGER_KEY, manager);

        await repository.updateDeliveryPersonId(dto);

        await expect(
          manager.findOne(DenormalOrderEntity, {
            relations: {
              requester: true,
              deliveryPerson: true,
            },
            where: { id: 1 },
          }),
        ).resolves.toEqual(result);
      });
    });
  });
});

import {
  DenormalOrderEntity,
  OrderParticipantEntity,
  UserEntity,
} from '@src/database/type-orm/entity';
import { UserBuilder } from './user.builder';

export class DenormalOrderBuilder {
  private readonly denormalOrder: DenormalOrderEntity;

  constructor() {
    this.denormalOrder = new DenormalOrderEntity();

    const requester = new UserBuilder()
      .withId('default-requester-id')
      .build();

    const participant = new OrderParticipantEntity();
    participant.id = 1;
    participant.senderName = '보내는사람';
    participant.senderPhone = '010-1234-5678';
    participant.receiverName = '받는사람';
    participant.receiverPhone = '010-8765-4321';

    this.denormalOrder.id = 1;
    this.denormalOrder.requester = requester;
    this.denormalOrder.deliveryPerson = null;
    this.denormalOrder.participant = participant;
    this.denormalOrder.detail = '테스트 비정규화 주문 상세';
    this.denormalOrder.walking = 0;
    this.denormalOrder.bicycle = 0;
    this.denormalOrder.scooter = 0;
    this.denormalOrder.bike = 0;
    this.denormalOrder.car = 1;
    this.denormalOrder.truck = 0;
    this.denormalOrder.width = 10;
    this.denormalOrder.length = 10;
    this.denormalOrder.height = 10;
    this.denormalOrder.weight = 10;
    this.denormalOrder.destinationX = 127.0;
    this.denormalOrder.destinationY = 37.5;
    this.denormalOrder.destinationDetail = '도착지 상세';
    this.denormalOrder.departureX = 127.0;
    this.denormalOrder.departureY = 37.5;
    this.denormalOrder.departureDetail = '출발지 상세';
    this.denormalOrder.deliveryPersonMatchedDate = null;
  }

  withId(id: number): this {
    this.denormalOrder.id = id;
    this.denormalOrder.participant.id = id;
    return this;
  }

  withRequester(requester: UserEntity): this {
    this.denormalOrder.requester = requester;
    return this;
  }

  withParticipant(participant: OrderParticipantEntity): this {
    this.denormalOrder.participant = participant;
    return this;
  }

  withDeliveryPerson(deliveryPerson: UserEntity | null): this {
    this.denormalOrder.deliveryPerson = deliveryPerson;
    return this;
  }

  withDetail(detail: string): this {
    this.denormalOrder.detail = detail;
    return this;
  }

  withTransportation(
    transportation: Partial<{
      walking: number;
      bicycle: number;
      scooter: number;
      bike: number;
      car: number;
      truck: number;
    }>,
  ): this {
    this.denormalOrder.walking =
      transportation.walking ?? this.denormalOrder.walking;
    this.denormalOrder.bicycle =
      transportation.bicycle ?? this.denormalOrder.bicycle;
    this.denormalOrder.scooter =
      transportation.scooter ?? this.denormalOrder.scooter;
    this.denormalOrder.bike = transportation.bike ?? this.denormalOrder.bike;
    this.denormalOrder.car = transportation.car ?? this.denormalOrder.car;
    this.denormalOrder.truck = transportation.truck ?? this.denormalOrder.truck;
    return this;
  }

  withProduct(
    product: Partial<{
      width: number;
      length: number;
      height: number;
      weight: number;
    }>,
  ): this {
    this.denormalOrder.width = product.width ?? this.denormalOrder.width;
    this.denormalOrder.length = product.length ?? this.denormalOrder.length;
    this.denormalOrder.height = product.height ?? this.denormalOrder.height;
    this.denormalOrder.weight = product.weight ?? this.denormalOrder.weight;
    return this;
  }

  withDeparture(
    departure: Partial<{
      x: number;
      y: number;
      detail: string;
    }>,
  ): this {
    this.denormalOrder.departureX =
      departure.x ?? this.denormalOrder.departureX;
    this.denormalOrder.departureY =
      departure.y ?? this.denormalOrder.departureY;
    this.denormalOrder.departureDetail =
      departure.detail ?? this.denormalOrder.departureDetail;
    return this;
  }

  withDestination(
    destination: Partial<{
      x: number;
      y: number;
      detail: string;
    }>,
  ): this {
    this.denormalOrder.destinationX =
      destination.x ?? this.denormalOrder.destinationX;
    this.denormalOrder.destinationY =
      destination.y ?? this.denormalOrder.destinationY;
    this.denormalOrder.destinationDetail =
      destination.detail ?? this.denormalOrder.destinationDetail;
    return this;
  }

  build(): DenormalOrderEntity {
    return this.denormalOrder;
  }
}

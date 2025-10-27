import {
  DepartureEntity,
  DestinationEntity,
  OrderEntity,
  ProductEntity,
  ReceiverEntity,
  SenderEntity,
  TransportationEntity,
  UserEntity,
} from '@src/database/type-orm/entity';

export class OrderBuilder {
  private readonly order: OrderEntity;

  constructor() {
    this.order = new OrderEntity();

    const requester = new UserEntity();
    requester.id = 'default-requester-id';
    requester.walletAddress = 'default-requester-wallet-address';
    requester.name = '테스트의뢰인';
    requester.email = 'requester@test.com';
    requester.contact = '010-1111-2222';

    this.order.id = 1;
    this.order.detail = '테스트 주문 상세';
    this.order.requester = requester;
    this.order.deliveryPerson = null;

    const product = new ProductEntity();
    product.id = this.order.id;
    product.width = 10;
    product.length = 10;
    product.height = 10;
    product.weight = 10;
    this.order.product = product;

    const transportation = new TransportationEntity();
    transportation.id = this.order.id;
    transportation.walking = 1;
    transportation.bicycle = 1;
    transportation.scooter = 1;
    transportation.bike = 1;
    transportation.car = 1;
    transportation.truck = 1;
    this.order.transportation = transportation;

    const destination = new DestinationEntity();
    destination.id = this.order.id;
    destination.x = 37.5;
    destination.y = 112;
    destination.detail = '도착지 상세';

    const receiver = new ReceiverEntity();
    receiver.id = this.order.id;
    receiver.name = '받는사람';
    receiver.phone = '010-8765-4321';
    destination.receiver = receiver;
    this.order.destination = destination;

    const departure = new DepartureEntity();
    departure.id = this.order.id;
    departure.x = 37.4;
    departure.y = 111;
    departure.detail = '출발지 상세';

    const sender = new SenderEntity();
    sender.id = this.order.id;
    sender.name = '보내는사람';
    sender.phone = '010-1234-5678';
    departure.sender = sender;
    this.order.departure = departure;
  }

  withOrderId(id: number): this {
    this.order.id = id;
    this.order.product.id = id;
    this.order.transportation.id = id;
    this.order.destination.id = id;
    this.order.destination.receiver.id = id;
    this.order.departure.id = id;
    this.order.departure.sender.id = id;
    return this;
  }

  withRequester(requester: UserEntity): this {
    this.order.requester = requester;
    return this;
  }

  withDeliveryPerson(deliveryPerson: UserEntity | null): this {
    this.order.deliveryPerson = deliveryPerson;
    return this;
  }

  withDetail(detail: string): this {
    this.order.detail = detail;
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
    this.order.product.width = product.width ?? this.order.product.width;
    this.order.product.length = product.length ?? this.order.product.length;
    this.order.product.height = product.height ?? this.order.product.height;
    this.order.product.weight = product.weight ?? this.order.product.weight;
    return this;
  }

  withTransportation(
    transportation: Partial<{
      walking: 0 | 1;
      bicycle: 0 | 1;
      scooter: 0 | 1;
      bike: 0 | 1;
      car: 0 | 1;
      truck: 0 | 1;
    }>,
  ): this {
    this.order.transportation.walking =
      transportation.walking ?? this.order.transportation.walking;
    this.order.transportation.bicycle =
      transportation.bicycle ?? this.order.transportation.bicycle;
    this.order.transportation.scooter =
      transportation.scooter ?? this.order.transportation.scooter;
    this.order.transportation.bike =
      transportation.bike ?? this.order.transportation.bike;
    this.order.transportation.car =
      transportation.car ?? this.order.transportation.car;
    this.order.transportation.truck =
      transportation.truck ?? this.order.transportation.truck;
    return this;
  }

  withDestination(
    destination: Partial<{
      x: number;
      y: number;
      detail: string;
    }>,
  ): this {
    this.order.destination.x = destination.x ?? this.order.destination.x;
    this.order.destination.y = destination.y ?? this.order.destination.y;
    this.order.destination.detail =
      destination.detail ?? this.order.destination.detail;
    return this;
  }

  withReceiver(
    receiver: Partial<{
      name: string;
      phone: string;
    }>,
  ): this {
    this.order.destination.receiver.name =
      receiver.name ?? this.order.destination.receiver.name;
    this.order.destination.receiver.phone =
      receiver.phone ?? this.order.destination.receiver.phone;
    return this;
  }

  withDeparture(
    departure: Partial<{
      x: number;
      y: number;
      detail: string;
    }>,
  ): this {
    this.order.departure.x = departure.x ?? this.order.departure.x;
    this.order.departure.y = departure.y ?? this.order.departure.y;
    this.order.departure.detail =
      departure.detail ?? this.order.departure.detail;
    return this;
  }

  withSender(
    sender: Partial<{
      name: string;
      phone: string;
    }>,
  ): this {
    this.order.departure.sender.name =
      sender.name ?? this.order.departure.sender.name;
    this.order.departure.sender.phone =
      sender.phone ?? this.order.departure.sender.phone;
    return this;
  }

  build(): OrderEntity {
    return this.order;
  }
}

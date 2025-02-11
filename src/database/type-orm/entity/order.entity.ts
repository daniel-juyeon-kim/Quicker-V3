import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import {
  DeliveryPersonMatchedDateEntity,
  DepartureEntity,
  DestinationEntity,
  ProductEntity,
  TransportationEntity,
  UserEntity,
} from '.';

@Entity({ name: 'order' })
export class OrderEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => UserEntity, (user) => user.requestOrder, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  requester: UserEntity;

  @ManyToOne(() => UserEntity, (user) => user.deliverOrder, {
    nullable: true,
  })
  @JoinColumn()
  deliveryPerson: UserEntity | null;

  @Column({ nullable: true })
  detail?: string;

  @OneToOne(
    () => TransportationEntity,
    (transportation) => transportation.order,
    {
      cascade: ['insert'],
    },
  )
  transportation: TransportationEntity;

  @OneToOne(() => ProductEntity, (product) => product.order, {
    cascade: ['insert'],
  })
  product: ProductEntity;

  @OneToOne(() => DestinationEntity, (destination) => destination.order, {
    cascade: ['insert'],
  })
  destination: DestinationEntity;

  @OneToOne(() => DepartureEntity, (departure) => departure.order, {
    cascade: ['insert'],
  })
  departure: DepartureEntity;

  @OneToOne(
    () => DeliveryPersonMatchedDateEntity,
    (deliveryPersonMatchedDate) => deliveryPersonMatchedDate.order,
  )
  deliveryPersonMatchedDate: DeliveryPersonMatchedDateEntity;
}

export type BasicOrder = Pick<OrderEntity, 'requester' | 'detail'>;

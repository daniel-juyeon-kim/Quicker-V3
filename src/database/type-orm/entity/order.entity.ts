import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import {
  DeliveryPersonMatchedDate,
  Departure,
  Destination,
  Product,
  Transportation,
  User,
} from '.';

@Entity()
export class Order {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => User, (user) => user.requestOrder, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  requester!: User;

  @ManyToOne(() => User, (user) => user.deliverOrder, {
    nullable: true,
  })
  @JoinColumn()
  deliveryPerson!: User | null;

  @Column({ nullable: true })
  detail?: string;

  @OneToOne(() => Transportation, (transportation) => transportation.order, {
    cascade: ['insert'],
  })
  transportation!: Transportation;

  @OneToOne(() => Product, (product) => product.order, {
    cascade: ['insert'],
  })
  product!: Product;

  @OneToOne(() => Destination, (destination) => destination.order, {
    cascade: ['insert'],
  })
  destination!: Destination;

  @OneToOne(() => Departure, (departure) => departure.order, {
    cascade: ['insert'],
  })
  departure!: Departure;

  @OneToOne(
    () => DeliveryPersonMatchedDate,
    (deliveryPersonMatchedDate) => deliveryPersonMatchedDate.order,
  )
  deliveryPersonMatchedDate!: DeliveryPersonMatchedDate;
}

export type BasicOrder = Pick<Order, 'requester' | 'detail'>;

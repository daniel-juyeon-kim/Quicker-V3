import { Inject, Injectable } from '@nestjs/common';
import { RepositoryToken } from '@src/core/constant';
import { IOrderRepository } from '@src/database';
import { CreateOrderDto } from './dto/create-order.dto';
import { IOrderService } from './order.service.interface';

@Injectable()
export class OrderService implements IOrderService {
  constructor(
    @Inject(RepositoryToken.ORDER_REPOSITORY)
    private readonly orderRepository: IOrderRepository,
  ) {}

  async createOrder(dto: CreateOrderDto) {
    await this.orderRepository.createOrder(dto);
  }

  async findAllOrderDetailByOrderIds(orderIds: number[]) {
    return await this.orderRepository.findAllCreatedOrDeliveredOrderDetailByOrderIds(
      orderIds,
    );
  }

  async findAllUnmatchedOrder(lastCheckedOrderId: number) {
    return await this.orderRepository.findAllUnmatchedOrder(lastCheckedOrderId);
  }
}

import { Inject, Injectable } from '@nestjs/common';
import { RepositoryToken } from '@src/core/constant';
import { IOrderRepository } from '@src/database';
import { IOrderQueryRepository } from '@src/database/type-orm/repository/order/order-query.repository.interface';
import { CreateOrderDto } from './dto/create-order.dto';
import { IOrderService } from './order.service.interface';

@Injectable()
export class OrderService implements IOrderService {
  @Inject(RepositoryToken.ORDER_REPOSITORY)
  private readonly orderRepository: IOrderRepository;
  @Inject(RepositoryToken.ORDER_QUERY_REPOSITORY)
  private readonly orderQueryRepository: IOrderQueryRepository;

  async createOrder(dto: CreateOrderDto) {
    await this.orderRepository.createOrder(dto);
  }

  async findAllOrderDetailByOrderIds(orderIds: number[]) {
    return await this.orderQueryRepository.findAllOrderDetailsByIds(orderIds);
  }

  async findAllUnmatchedOrder(lastCheckedOrderId: number) {
    return await this.orderQueryRepository.findAllUnmatchedOrder(
      lastCheckedOrderId,
    );
  }
}

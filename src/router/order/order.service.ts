import { Inject, Injectable } from '@nestjs/common';
import { RepositoryToken } from '@src/core/constant';
import { IOrderRepository } from '@src/database';
import { CreateOrderDto } from './dto/create-order.dto';
import { IOrderService } from './order.service.interface';

@Injectable()
export class OrderService implements IOrderService {
  constructor(
    @Inject(RepositoryToken.ORDER_REPOSITORY)
    private readonly repository: IOrderRepository,
  ) {}

  async createOrder(dto: CreateOrderDto) {
    await this.repository.create(dto);
  }

  async findAllOrderDetail(orderIds: number[]) {
    return await this.repository.findAllCreatedOrDeliveredOrderDetailByOrderIds(
      orderIds,
    );
  }

  async findAllMatchableOrder(walletAddress: string) {
    return await this.repository.findAllMatchableOrderByWalletAddress(
      walletAddress,
    );
  }
}

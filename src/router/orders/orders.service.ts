import { Inject, Injectable } from '@nestjs/common';
import { RepositoryToken } from '@src/core/constant';
import { IOrderRepository } from '@src/database';
import { CreateOrderDto } from './dto/create-orders.dto';
import { IOrdersService } from './orders.service.interface';

@Injectable()
export class OrdersService implements IOrdersService {
  constructor(
    @Inject(RepositoryToken.ORDER_REPOSITORY)
    private readonly repository: IOrderRepository,
  ) {}

  async createOrder(dto: CreateOrderDto) {
    await this.repository.createOrder(dto);
  }

  async findAllOrderDetailByOrderIds(orderIds: number[]) {
    return await this.repository.findAllCreatedOrDeliveredOrderDetailByOrderIds(
      orderIds,
    );
  }

  async findAllMatchableOrderByWalletAddress(walletAddress: string) {
    return await this.repository.findAllMatchableOrderByWalletAddress(
      walletAddress,
    );
  }
}

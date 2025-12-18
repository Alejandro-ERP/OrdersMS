import { HttpStatus, Injectable } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { PaginationDto } from 'src/common';
import { PrismaService } from 'src/prisma.service';
import { RpcException } from '@nestjs/microservices';
import { of } from 'rxjs';

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

  create(createOrderDto: CreateOrderDto) {
    return this.prisma.order.create({
      data: createOrderDto,
    });
  }

  async findAll(paginationDto: PaginationDto) {
    const { limit, offset, status } = paginationDto;

    const statusFilter = status ? { status } : {};

    const totalOrders = await this.prisma.order.count({
      where: statusFilter,
    });

    const orders = await this.prisma.order.findMany({
      where: statusFilter,
      skip: (offset - 1) * limit,
      take: limit,
    });

    return {
      total: totalOrders,
      orders,
      meta: {
        limit,
        offset,
        totalPages: Math.ceil(totalOrders / limit),
      },
    };
  }

  async findOne(id: string) {
    const order = await this.prisma.order.findFirst({ where: { id } });

    if (!order) {
      throw new RpcException({
        message: `Order with ID ${id} not found`,
        status: HttpStatus.NOT_FOUND,
      });
    }

    return order;
  }

  async update( updateOrderDto: UpdateOrderDto) {
    const { id, ...data } = updateOrderDto;

    const order = await this.findOne(id);

    if(order.status === data.status){
      return order;
    }

    return this.prisma.order.update({
      where: { id },
      data,
    });
    
  }
}

import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { PaginationDto } from 'src/common';
import { PrismaService } from 'src/prisma.service';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { NATS_SERVICE } from 'src/transport/service';

@Injectable()
export class OrdersService {
  constructor(
    @Inject(NATS_SERVICE) private client: ClientProxy,
    private prisma: PrismaService,
  ) {}

  async create(createOrderDto: CreateOrderDto) {
    const { items } = createOrderDto;
    const ids = items.map((item) => item.productId);

    const products = await firstValueFrom(
      this.client.send({ cmd: 'get_product_list' }, { ids }),
    );

    const totalAmount = items.reduce((acc, item) => {
      const product = products.find((p) => p.id === item.productId);
      return acc + product.price * item.quantity;
    }, 0);

    const totalItems = items.reduce((acc, item) => acc + item.quantity, 0);

    const order = await this.prisma.order.create({
      data: {
        totalAmount,
        totalItems,
        OrderItem: {
          create: items.map((item) => ({
            productId: products.find((p) => p.id === item.productId).id,
            quantity: items.reduce((acc, i) => acc + i.quantity, 0),
            price: products.find((p) => p.id === item.productId).price,
          })),
        },
      },
      select: {
        id: true,
        totalAmount: true,
        totalItems: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        OrderItem: {
          select: {
            productId: true,
            quantity: true,
            price: true,
          },
        },
      },
    });

    const { OrderItem, ...data } = order;

    return {
      data,
      items: OrderItem.map((item) => {
        const product = products.find((p) => p.id == item.productId);

        return {
          name: product.name,
          amount: item.price,
          quantity: item.quantity,
        };
      }),
    };
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
    const order = await this.prisma.order.findFirst({
      where: { id },
      select: {
        OrderItem: {
          select: {
            id: true,
            productId: true,
            quantity: true,
            price: true,
          },
        },
        id: true,
        totalAmount: true,
        totalItems: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!order) {
      throw new RpcException({
        message: `Order with ID ${id} not found`,
        status: HttpStatus.NOT_FOUND,
      });
    }

    return order;
  }

  async update(updateOrderDto: UpdateOrderDto) {
    const { id, ...data } = updateOrderDto;

    const order = await this.findOne(id);

    if (order.status === data.status) {
      return order;
    }

    return this.prisma.order.update({
      where: { id },
      data,
    });
  }
}

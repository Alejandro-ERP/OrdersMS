import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { PaginationDto } from 'src/common';
import { PrismaService } from 'src/prisma.service';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { NATS_SERVICE } from 'src/transport/service';
import { ProductType } from './types/product.type';

@Injectable()
export class OrdersService {
  constructor(
    @Inject(NATS_SERVICE) private client: ClientProxy,
    private prisma: PrismaService,
  ) {}

  async create(createOrderDto: CreateOrderDto) {
    const { items, currency } = createOrderDto;
    const ids = items.map((item) => item.productId);

    const products = (await firstValueFrom(
      this.client.send({ cmd: 'get_product_list' }, { ids }),
    )) as ProductType[];

    const productsList = items.map((item) => {
      const product = products.find((product) => product.id === item.productId);

      if (!product) {
        throw new RpcException(`Product ${item.productId} not found`);
      }

      return {
        productId: product.id,
        name: product.name,
        quantity: item.quantity,
        price: product.price,
      };
    });

    const totalAmount = productsList.reduce((acc, product) => {
      return acc + product.price * product.quantity;
    }, 0);

    const totalItems = productsList.reduce(
      (acc, product) => acc + product.quantity,
      0,
    );

    const order = await this.prisma.order.create({
      data: {
        totalAmount,
        totalItems,
        OrderItem: {
          create: productsList.map((product) => {
            return {
              productId: product.productId,
              quantity: product.quantity,
              price: product.price,
            };
          }),
        },
      },
      include: {
        OrderItem: true,
      },
    });

    const paymentCompleted = await firstValueFrom(
      this.client.send('create-payment-session', {
        orderId: order.id,
        currency,
        items: productsList.map((product) => ({
          name: product.name,
          amount: product.price,
          quantity: product.quantity,
        })),
      }),
    );

    const { id, createdAt, updatedAt, ...data } = order;

    return {
      data,
      payment: paymentCompleted,
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

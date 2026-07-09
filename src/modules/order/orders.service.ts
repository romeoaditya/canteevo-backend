import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PromoCodesService } from '../promo-code/promo-codes.service';
import { CreateOrderDto, UpdateOrderStatusDto } from './dto/orders.dto';

const SERVICE_FEE = 500;

@Injectable()
export class OrdersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly promoCodesService: PromoCodesService,
  ) {}

  async create(userId: string, dto: CreateOrderDto) {
    const promo = dto.promoCode
      ? await this.promoCodesService.validateCode(dto.promoCode)
      : null;

    return this.prisma.$transaction(async (tx) => {
      const user = await tx.user.findUnique({ where: { id: userId } });
      if (!user) {
        throw new NotFoundException('User tidak ditemukan');
      }

      const cartItems = await tx.cartItem.findMany({
        where: {
          userId,
          isSelected: true,
          menuItem: { merchantId: dto.merchantId },
        },
        include: { menuItem: true },
      });

      if (cartItems.length === 0) {
        throw new BadRequestException(
          'Tidak ada item yang dipilih untuk checkout',
        );
      }

      const subtotal = cartItems.reduce(
        (sum, item) => sum + item.menuItem.price * item.quantity,
        0,
      );
      const serviceFee = SERVICE_FEE;

      const coinDiscount = dto.useCoin
        ? Math.min(user.coinBalance, subtotal)
        : 0;

      const promoDiscount = promo
        ? Math.min(promo.discountAmount, subtotal + serviceFee - coinDiscount)
        : 0;

      const total = Math.max(
        subtotal + serviceFee - coinDiscount - promoDiscount,
        0,
      );

      const order = await tx.order.create({
        data: {
          userId,
          merchantId: dto.merchantId,
          paymentMethod: dto.paymentMethod,
          subtotal,
          serviceFee,
          coinDiscount,
          promoDiscount,
          total,
          promoCodeId: promo?.id,
          items: {
            create: cartItems.map((item) => ({
              menuItemId: item.menuItemId,
              quantity: item.quantity,
              priceAtOrder: item.menuItem.price,
              variant: item.variant,
              note: item.note,
            })),
          },
        },
        include: {
          items: { include: { menuItem: true } },
          merchant: true,
          promoCode: true,
        },
      });

      if (coinDiscount > 0) {
        await tx.user.update({
          where: { id: userId },
          data: { coinBalance: { decrement: coinDiscount } },
        });
      }

      await tx.cartItem.deleteMany({
        where: { id: { in: cartItems.map((item) => item.id) } },
      });

      return order;
    });
  }

  findAllForUser(userId: string) {
    return this.prisma.order.findMany({
      where: { userId },
      include: {
        merchant: { select: { id: true, name: true } },
        items: {
          include: { menuItem: { select: { name: true, imageUrl: true } } },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, userId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        merchant: true,
        promoCode: true,
        items: { include: { menuItem: true } },
      },
    });

    if (!order) {
      throw new NotFoundException(`Order dengan id "${id}" tidak ditemukan`);
    }
    if (order.userId !== userId) {
      throw new ForbiddenException('Kamu tidak punya akses ke order ini');
    }

    return order;
  }

  async updateStatus(id: string, userId: string, dto: UpdateOrderStatusDto) {
    await this.findOne(id, userId);

    return this.prisma.order.update({
      where: { id },
      data: {
        status: dto.status,
        ...(dto.status === 'SUCCESS' && { paidAt: new Date() }),
      },
    });
  }
}

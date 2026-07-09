import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCartItemDto, UpdateCartItemDto } from './dto/carts.dto';

@Injectable()
export class CartService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, createCartItemDto: CreateCartItemDto) {
    const menuItem = await this.prisma.menuItem.findUnique({
      where: { id: createCartItemDto.menuItemId },
    });
    if (!menuItem) {
      throw new NotFoundException(
        `Menu dengan id "${createCartItemDto.menuItemId}" tidak ditemukan`,
      );
    }

    // cek dulu, kalau menu + varian yang sama udah ada di cart user ini,
    // tambahin quantity-nya aja, jangan bikin baris baru
    const existingItem = await this.prisma.cartItem.findFirst({
      where: {
        userId,
        menuItemId: createCartItemDto.menuItemId,
        variant: createCartItemDto.variant ?? null,
      },
    });

    if (existingItem) {
      return this.prisma.cartItem.update({
        where: { id: existingItem.id },
        data: {
          quantity: existingItem.quantity + (createCartItemDto.quantity ?? 1),
        },
        include: { menuItem: true },
      });
    }

    return this.prisma.cartItem.create({
      data: {
        ...createCartItemDto,
        userId,
      },
      include: { menuItem: true },
    });
  }

  findAllForUser(userId: string) {
    return this.prisma.cartItem.findMany({
      where: { userId },
      include: {
        menuItem: {
          include: { merchant: { select: { id: true, name: true } } },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // dipake buat "Ringkasan Pesanan" -- cuma ngitung item yang isSelected: true
  async getSummary(userId: string) {
    const selectedItems = await this.prisma.cartItem.findMany({
      where: { userId, isSelected: true },
      include: { menuItem: { select: { price: true } } },
    });

    const totalItems = selectedItems.reduce(
      (sum, item) => sum + item.quantity,
      0,
    );
    const subtotal = selectedItems.reduce(
      (sum, item) => sum + item.menuItem.price * item.quantity,
      0,
    );

    return { totalItems, subtotal };
  }

  private async findOwnedOrThrow(id: string, userId: string) {
    const cartItem = await this.prisma.cartItem.findUnique({ where: { id } });

    if (!cartItem) {
      throw new NotFoundException(
        `Cart item dengan id "${id}" tidak ditemukan`,
      );
    }
    if (cartItem.userId !== userId) {
      throw new ForbiddenException('Kamu tidak punya akses ke cart item ini');
    }

    return cartItem;
  }

  async update(
    id: string,
    userId: string,
    updateCartItemDto: UpdateCartItemDto,
  ) {
    await this.findOwnedOrThrow(id, userId);

    return this.prisma.cartItem.update({
      where: { id },
      data: updateCartItemDto,
      include: { menuItem: true },
    });
  }

  async remove(id: string, userId: string) {
    await this.findOwnedOrThrow(id, userId);

    return this.prisma.cartItem.delete({ where: { id } });
  }

  async clearSelected(userId: string) {
    return this.prisma.cartItem.deleteMany({
      where: { userId, isSelected: true },
    });
  }
}

import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import {
  CreateMenuItemDto,
  FindMenuItemsQueryDto,
  UpdateMenuItemDto,
} from './dto/menu-items.dto.js';
import { CloudinaryService } from '../cloudinary/cloudinary.service.js';

@Injectable()
export class MenuItemsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  private async validateRelations(merchantId?: string, categoryId?: string) {
    if (merchantId) {
      const merchant = await this.prisma.merchant.findUnique({
        where: { id: merchantId },
      });
      if (!merchant) {
        throw new NotFoundException(
          `Merchant dengan id "${merchantId}" tidak ditemukan`,
        );
      }
    }

    if (categoryId) {
      const category = await this.prisma.category.findUnique({
        where: { id: categoryId },
      });
      if (!category) {
        throw new NotFoundException(
          `Category dengan id "${categoryId}" tidak ditemukan`,
        );
      }
    }
  }

  async create(
    createMenuItemDto: CreateMenuItemDto,
    file?: Express.Multer.File,
  ) {
    const { nutrition, merchantId, categoryId, ...menuData } =
      createMenuItemDto;

    await this.validateRelations(merchantId, categoryId);

    // Upload image ke Cloudinary kalau ada
    let imageUrl: string | undefined;
    if (file) {
      imageUrl = await this.cloudinaryService.uploadImage(
        file,
        'canteevo/menu-items',
      );
    }

    return this.prisma.menuItem.create({
      data: {
        ...menuData,
        imageUrl,
        merchant: { connect: { id: merchantId } },
        ...(categoryId && { category: { connect: { id: categoryId } } }),
        ...(nutrition && { nutrition: { create: nutrition } }),
      },
      include: { nutrition: true },
    });
  }

  async findAll(query: FindMenuItemsQueryDto) {
    return this.prisma.menuItem.findMany({
      where: {
        categoryId: query.categoryId,
        merchantId: query.merchantId,
        ...(query.isRecommended !== undefined && {
          isRecommended: query.isRecommended === 'true',
        }),
      },
      include: {
        merchant: { select: { id: true, name: true } },
        category: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const menuItem = await this.prisma.menuItem.findUnique({
      where: { id },
      include: {
        merchant: true,
        category: true,
        nutrition: true,
        reviews: {
          include: { user: { select: { id: true, name: true } } },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!menuItem) {
      throw new NotFoundException(`Menu dengan id "${id}" tidak ditemukan`);
    }

    const averageRating =
      menuItem.reviews.length > 0
        ? menuItem.reviews.reduce((sum, r) => sum + r.rating, 0) /
          menuItem.reviews.length
        : 0;

    return { ...menuItem, averageRating };
  }

  async update(
    id: string,
    updateMenuItemDto: UpdateMenuItemDto,
    file?: Express.Multer.File,
  ) {
    const { nutrition, merchantId, categoryId, ...menuData } =
      updateMenuItemDto;

    await this.findOne(id);
    await this.validateRelations(merchantId, categoryId);

    // Upload image baru ke Cloudinary kalau ada
    let imageUrl: string | undefined;
    if (file) {
      imageUrl = await this.cloudinaryService.uploadImage(
        file,
        'canteevo/menu-items',
      );
    }

    return this.prisma.menuItem.update({
      where: { id },
      data: {
        ...menuData,
        ...(imageUrl && { imageUrl }),
        ...(merchantId && { merchant: { connect: { id: merchantId } } }),
        ...(categoryId && { category: { connect: { id: categoryId } } }),
        ...(nutrition && {
          nutrition: {
            upsert: {
              create: nutrition,
              update: nutrition,
            },
          },
        }),
      },
      include: { nutrition: true },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.menuItem.delete({ where: { id } });
  }
}

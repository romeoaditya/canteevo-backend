import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateMerchantDto, UpdateMerchantDto } from './dto/merchants.dto.js';
import { CloudinaryService } from '../cloudinary/cloudinary.service.js';

@Injectable()
export class MerchantsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async create(
    createMerchantDto: CreateMerchantDto,
    file?: Express.Multer.File,
  ) {
    let imageUrl: string | undefined;
    if (file) {
      imageUrl = await this.cloudinaryService.uploadImage(
        file,
        'canteevo/merchants',
      );
    }

    return this.prisma.merchant.create({
      data: {
        ...createMerchantDto,
        imageUrl,
      },
    });
  }

  findAll() {
    return this.prisma.merchant.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string) {
    const merchant = await this.prisma.merchant.findUnique({
      where: { id },
    });
    if (!merchant) {
      throw new NotFoundException(`Merchant dengan id "${id}" tidak ditemukan`);
    }
    return merchant;
  }

  async findOneWithMenus(id: string) {
    const merchant = await this.prisma.merchant.findUnique({
      where: { id },
      include: { menuItems: true },
    });
    if (!merchant) {
      throw new NotFoundException(`Merchant dengan id "${id}" tidak ditemukan`);
    }
    return merchant;
  }

  async update(
    id: string,
    updateMerchantDto: UpdateMerchantDto,
    file?: Express.Multer.File,
  ) {
    await this.findOne(id);

    let imageUrl: string | undefined;
    if (file) {
      imageUrl = await this.cloudinaryService.uploadImage(
        file,
        'canteevo/merchants',
      );
    }

    return this.prisma.merchant.update({
      where: { id },
      data: {
        ...updateMerchantDto,
        ...(imageUrl && { imageUrl }),
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.merchant.delete({
      where: { id },
    });
  }
}

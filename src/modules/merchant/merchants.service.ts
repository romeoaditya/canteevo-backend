import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMerchantDto, UpdateMerchantDto } from './dto/merchants.dto';

@Injectable()
export class MerchantsService {
  constructor(private readonly prisma: PrismaService) {}

  create(createMerchantDto: CreateMerchantDto) {
    return this.prisma.merchant.create({
      data: createMerchantDto,
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

  async update(id: string, updateMerchantDto: UpdateMerchantDto) {
    await this.findOne(id);

    return this.prisma.merchant.update({
      where: { id },
      data: updateMerchantDto,
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    return this.prisma.merchant.delete({
      where: { id },
    });
  }
}

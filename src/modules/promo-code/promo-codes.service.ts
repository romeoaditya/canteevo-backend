import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePromoCodeDto, UpdatePromoCodeDto } from './dto/promo-codes.dto';

@Injectable()
export class PromoCodesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createPromoCodeDto: CreatePromoCodeDto) {
    const code = createPromoCodeDto.code.toUpperCase();

    const existing = await this.prisma.promoCode.findUnique({
      where: { code },
    });
    if (existing) {
      throw new ConflictException(`Kode promo "${code}" sudah ada`);
    }

    return this.prisma.promoCode.create({
      data: { ...createPromoCodeDto, code },
    });
  }

  findAll() {
    return this.prisma.promoCode.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const promoCode = await this.prisma.promoCode.findUnique({ where: { id } });
    if (!promoCode) {
      throw new NotFoundException(
        `Promo code dengan id "${id}" tidak ditemukan`,
      );
    }
    return promoCode;
  }

  async validateCode(code: string) {
    const promoCode = await this.prisma.promoCode.findUnique({
      where: { code: code.toUpperCase() },
    });

    if (!promoCode) {
      throw new NotFoundException('Kode promo tidak ditemukan');
    }

    if (!promoCode.isActive) {
      throw new BadRequestException('Kode promo sudah tidak aktif');
    }

    if (promoCode.expiresAt && promoCode.expiresAt < new Date()) {
      throw new BadRequestException('Kode promo sudah kedaluwarsa');
    }

    return promoCode;
  }

  async update(id: string, updatePromoCodeDto: UpdatePromoCodeDto) {
    await this.findOne(id);

    return this.prisma.promoCode.update({
      where: { id },
      data: {
        ...updatePromoCodeDto,
        ...(updatePromoCodeDto.code && {
          code: updatePromoCodeDto.code.toUpperCase(),
        }),
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.promoCode.delete({ where: { id } });
  }
}

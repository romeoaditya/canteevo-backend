import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReviewDto, UpdateReviewDto } from './dto/reviews.dto';

@Injectable()
export class ReviewsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, createReviewDto: CreateReviewDto) {
    const menuItem = await this.prisma.menuItem.findUnique({
      where: { id: createReviewDto.menuItemId },
    });
    if (!menuItem) {
      throw new NotFoundException(
        `Menu dengan id "${createReviewDto.menuItemId}" tidak ditemukan`,
      );
    }

    const hasPurchased = await this.prisma.orderItem.findFirst({
      where: {
        menuItemId: createReviewDto.menuItemId,
        order: {
          userId,
          status: 'SUCCESS',
        },
      },
    });
    if (!hasPurchased) {
      throw new ForbiddenException(
        'Kamu cuma bisa review menu yang udah pernah kamu beli',
      );
    }

    const existingReview = await this.prisma.review.findFirst({
      where: { userId, menuItemId: createReviewDto.menuItemId },
    });
    if (existingReview) {
      throw new ConflictException(
        'Kamu sudah pernah kasih review buat menu ini. Edit review yang sudah ada aja.',
      );
    }

    return this.prisma.review.create({
      data: {
        ...createReviewDto,
        userId,
      },
      include: { user: { select: { id: true, name: true } } },
    });
  }

  findAllForMenuItem(menuItemId: string) {
    return this.prisma.review.findMany({
      where: { menuItemId },
      include: { user: { select: { id: true, name: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const review = await this.prisma.review.findUnique({
      where: { id },
      include: { user: { select: { id: true, name: true } } },
    });

    if (!review) {
      throw new NotFoundException(`Review dengan id "${id}" tidak ditemukan`);
    }

    return review;
  }
  async getAverageRating(menuItemId: string) {
    const result = await this.prisma.review.aggregate({
      where: { menuItemId },
      _avg: { rating: true },
      _count: true,
    });

    return {
      average: result._avg.rating ?? 0,
      totalReviews: result._count,
    };
  }

  async update(id: string, userId: string, updateReviewDto: UpdateReviewDto) {
    const review = await this.findOne(id);

    // cuma pemilik review yang boleh edit
    if (review.userId !== userId) {
      throw new ForbiddenException('Kamu tidak punya akses ke review ini');
    }

    return this.prisma.review.update({
      where: { id },
      data: updateReviewDto,
      include: { user: { select: { id: true, name: true } } },
    });
  }

  async remove(id: string, userId: string) {
    const review = await this.findOne(id);

    if (review.userId !== userId) {
      throw new ForbiddenException('Kamu tidak punya akses ke review ini');
    }

    return this.prisma.review.delete({ where: { id } });
  }
}

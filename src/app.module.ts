import { Module } from '@nestjs/common';
import { NestModule, MiddlewareConsumer } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { ConfigModule } from './config/config.module.js';
import { LoggerModule } from './modules/logger/logger.module.js';
import { PrismaModule } from './modules/prisma/prisma.module.js';
import { AuthModule } from './modules/auth/auth.module.js';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter.js';
import { RequestIdMiddleware } from './common/middleware/request-id.middleware.js';
import { LoggerMiddleware } from './common/middleware/logger.middleware.js';
import { CategoriesModule } from './modules/category/categories.module.js';
import { MerchantsModule } from './modules/merchant/merchants.module.js';
import { MenuItemsModule } from './modules/menu-item/menu-items.module.js';
import { ReviewsModule } from './modules/review/reviews.module.js';
import { CartModule } from './modules/cart/carts.module.js';
import { PromoCodesModule } from './modules/promo-code/promo-codes.module.js';
import { OrdersModule } from './modules/order/orders.module.js';

@Module({
  imports: [
    ConfigModule,
    LoggerModule,
    PrismaModule,
    AuthModule,
    CategoriesModule,
    MerchantsModule,
    MenuItemsModule,
    CartModule,
    OrdersModule,
    PromoCodesModule,
    ReviewsModule,
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(RequestIdMiddleware, LoggerMiddleware).forRoutes('*');
  }
}

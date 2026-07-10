import { Module } from '@nestjs/common';
import { MenuItemsService } from './menu-items.service.js';
import { MenuItemsController } from './menu-items.controller.js';
import { PrismaModule } from '../prisma/prisma.module.js';
import { CloudinaryModule } from '../cloudinary/cloudinary.module.js';
import { MulterModule } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';

@Module({
  imports: [
    PrismaModule,
    CloudinaryModule,
    MulterModule.register({
      storage: memoryStorage(),
    }),
  ],
  controllers: [MenuItemsController],
  providers: [MenuItemsService],
})
export class MenuItemsModule {}

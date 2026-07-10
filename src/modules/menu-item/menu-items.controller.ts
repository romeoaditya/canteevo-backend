import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { MenuItemsService } from './menu-items.service.js';
import {
  CreateMenuItemDto,
  FindMenuItemsQueryDto,
  UpdateMenuItemDto,
} from './dto/menu-items.dto.js';

@Controller('menu-items')
export class MenuItemsController {
  constructor(private readonly menuItemsService: MenuItemsService) {}

  @Post()
  @UseInterceptors(FileInterceptor('image'))
  create(
    @Body() createMenuItemDto: CreateMenuItemDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.menuItemsService.create(createMenuItemDto, file);
  }

  @Get()
  findAll(@Query() query: FindMenuItemsQueryDto) {
    return this.menuItemsService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.menuItemsService.findOne(id);
  }

  @Patch(':id')
  @UseInterceptors(FileInterceptor('image'))
  update(
    @Param('id') id: string,
    @Body() updateMenuItemDto: UpdateMenuItemDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.menuItemsService.update(id, updateMenuItemDto, file);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.menuItemsService.remove(id);
  }
}

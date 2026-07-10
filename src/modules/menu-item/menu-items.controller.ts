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
import { ApiConsumes, ApiBody, ApiTags, ApiOperation } from '@nestjs/swagger';
import { MenuItemsService } from './menu-items.service.js';
import {
  CreateMenuItemDto,
  FindMenuItemsQueryDto,
  UpdateMenuItemDto,
} from './dto/menu-items.dto.js';

@ApiTags('Menu Items')
@Controller('menu-items')
export class MenuItemsController {
  constructor(private readonly menuItemsService: MenuItemsService) {}

  @Post()
  @UseInterceptors(FileInterceptor('image'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Create menu item with image upload' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        image: { type: 'string', format: 'binary' },
        name: { type: 'string' },
        description: { type: 'string' },
        price: { type: 'number' },
        isRecommended: { type: 'boolean' },
        merchantId: { type: 'string' },
        categoryId: { type: 'string' },
        nutrition: { type: 'object' },
      },
    },
  })
  create(
    @Body() createMenuItemDto: CreateMenuItemDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.menuItemsService.create(createMenuItemDto, file);
  }

  @Get()
  @ApiOperation({ summary: 'Get all menu items' })
  findAll(@Query() query: FindMenuItemsQueryDto) {
    return this.menuItemsService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get menu item by id' })
  findOne(@Param('id') id: string) {
    return this.menuItemsService.findOne(id);
  }

  @Patch(':id')
  @UseInterceptors(FileInterceptor('image'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Update menu item' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        image: { type: 'string', format: 'binary' },
        name: { type: 'string' },
        description: { type: 'string' },
        price: { type: 'number' },
        isRecommended: { type: 'boolean' },
        merchantId: { type: 'string' },
        categoryId: { type: 'string' },
        nutrition: { type: 'object' },
      },
    },
  })
  update(
    @Param('id') id: string,
    @Body() updateMenuItemDto: UpdateMenuItemDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.menuItemsService.update(id, updateMenuItemDto, file);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete menu item' })
  remove(@Param('id') id: string) {
    return this.menuItemsService.remove(id);
  }
}

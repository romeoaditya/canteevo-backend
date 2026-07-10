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
import { MerchantsService } from './merchants.service.js';
import { CreateMerchantDto, UpdateMerchantDto } from './dto/merchants.dto.js';

@ApiTags('Merchants')
@Controller('merchants')
export class MerchantsController {
  constructor(private readonly merchantsService: MerchantsService) {}

  @Post()
  @UseInterceptors(FileInterceptor('image'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Create merchant with image upload' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        image: { type: 'string', format: 'binary' },
        name: { type: 'string' },
        location: { type: 'string' },
      },
    },
  })
  create(
    @Body() createMerchantDto: CreateMerchantDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.merchantsService.create(createMerchantDto, file);
  }

  @Get()
  @ApiOperation({ summary: 'Get all merchants' })
  findAll() {
    return this.merchantsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get merchant by id' })
  findOne(@Param('id') id: string, @Query('withMenus') withMenus?: string) {
    if (withMenus === 'true') {
      return this.merchantsService.findOneWithMenus(id);
    }
    return this.merchantsService.findOne(id);
  }

  @Patch(':id')
  @UseInterceptors(FileInterceptor('image'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Update merchant with image upload' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        image: { type: 'string', format: 'binary' },
        name: { type: 'string' },
        location: { type: 'string' },
      },
    },
  })
  update(
    @Param('id') id: string,
    @Body() updateMerchantDto: UpdateMerchantDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.merchantsService.update(id, updateMerchantDto, file);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete merchant' })
  remove(@Param('id') id: string) {
    return this.merchantsService.remove(id);
  }
}

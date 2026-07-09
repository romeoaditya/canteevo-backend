import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CartService } from './carts.service';
import { CreateCartItemDto, UpdateCartItemDto } from './dto/carts.dto';

@ApiTags('Cart')
@Controller('cart')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('bearer')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Post()
  create(@Req() req, @Body() createCartItemDto: CreateCartItemDto) {
    return this.cartService.create(req.user.id, createCartItemDto);
  }

  @Get()
  findAll(@Req() req) {
    return this.cartService.findAllForUser(req.user.id);
  }

  @Get('summary')
  getSummary(@Req() req) {
    return this.cartService.getSummary(req.user.id);
  }

  @Patch(':id')
  update(
    @Req() req,
    @Param('id') id: string,
    @Body() updateCartItemDto: UpdateCartItemDto,
  ) {
    return this.cartService.update(id, req.user.id, updateCartItemDto);
  }

  @Delete(':id')
  remove(@Req() req, @Param('id') id: string) {
    return this.cartService.remove(id, req.user.id);
  }
}

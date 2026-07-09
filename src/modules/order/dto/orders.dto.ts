import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { OrderStatus, PaymentMethodType } from '@prisma/client';

export class CreateOrderDto {
  @IsUUID()
  @IsNotEmpty()
  merchantId: string;

  @IsEnum(PaymentMethodType)
  paymentMethod: PaymentMethodType;

  @IsString()
  @IsOptional()
  promoCode?: string;

  @IsBoolean()
  @IsOptional()
  useCoin?: boolean = false;
}

export class UpdateOrderStatusDto {
  @IsEnum(OrderStatus)
  status: OrderStatus;
}

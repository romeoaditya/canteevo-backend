import {
  IsBoolean,
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
} from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';

export class CreatePromoCodeDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(30)
  code: string;

  @IsInt()
  @IsPositive()
  discountAmount: number;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean = true;

  @IsDateString()
  @IsOptional()
  expiresAt?: string;
}

export class UpdatePromoCodeDto extends PartialType(CreatePromoCodeDto) {}

import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  IsUrl,
  IsUUID,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';
import { Type } from 'class-transformer';

export class CreateNutritionDto {
  @IsInt()
  @IsPositive()
  calories: number;

  @IsNumber()
  @IsPositive()
  protein: number;

  @IsNumber()
  @IsPositive()
  carbs: number;

  @IsNumber()
  @IsPositive()
  fat: number;
}

export class CreateMenuItemDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsInt()
  @IsPositive()
  @Type(() => Number)
  price: number;

  @IsBoolean()
  @IsOptional()
  @Type(() => Boolean)
  isRecommended?: boolean;

  @IsUUID()
  @IsNotEmpty()
  merchantId: string;

  @IsUUID()
  @IsOptional()
  categoryId?: string;

  @ValidateNested()
  @Type(() => CreateNutritionDto)
  @IsOptional()
  nutrition?: CreateNutritionDto;
}

export class UpdateMenuItemDto extends PartialType(CreateMenuItemDto) {}

export class FindMenuItemsQueryDto {
  @IsUUID()
  @IsOptional()
  categoryId?: string;

  @IsUUID()
  @IsOptional()
  merchantId?: string;

  @IsOptional()
  isRecommended?: string;
}

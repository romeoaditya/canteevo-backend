import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
} from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';

export class CreateMerchantDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @IsString()
  @IsOptional()
  @MaxLength(150)
  location?: string;

  @IsUrl()
  @IsOptional()
  imageUrl?: string;
}

export class UpdateMerchantDto extends PartialType(CreateMerchantDto) {}

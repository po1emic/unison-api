import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

export class CreateCommunityDto {
  @IsNotEmpty()
  @IsUUID()
  ownerId: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(128)
  name: string;

  @IsString()
  @MaxLength(300)
  description?: string;

  @IsOptional()
  avatarSrc?: string;

  @IsOptional()
  bannerSrc?: string;

  @IsBoolean()
  @Type(() => Boolean)
  isPrivate: boolean;
}

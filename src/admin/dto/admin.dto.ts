// admin/dto/admin.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
} from 'class-validator';
import { PlanType, Role, SubscriptionStatus } from '../../generated/prisma/client.js';

export class PageQueryDto {
  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = 1;

  @ApiPropertyOptional({ default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit: number = 20;
}

export class UserQueryDto extends PageQueryDto {
  @ApiPropertyOptional({ description: 'Search by name or email' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ enum: Role })
  @IsOptional()
  @IsEnum(Role)
  role?: Role;
}

export class UpdateRoleDto {
  @ApiProperty({ enum: Role })
  @IsEnum(Role)
  role: Role;
}

export class AdminUpdateSubscriptionDto {
  @ApiPropertyOptional({ enum: PlanType })
  @IsOptional()
  @IsEnum(PlanType)
  plan?: PlanType;

  @ApiPropertyOptional({ enum: SubscriptionStatus })
  @IsOptional()
  @IsEnum(SubscriptionStatus)
  status?: SubscriptionStatus;

  @ApiPropertyOptional({ example: 500 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  requestLimit?: number;
}

export class LogQueryDto extends PageQueryDto {
  @ApiPropertyOptional({ example: 'GET' })
  @IsOptional()
  @IsString()
  method?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  userId?: string;

  @ApiPropertyOptional({ description: 'Only status >= 400' })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  errorsOnly?: boolean;
}
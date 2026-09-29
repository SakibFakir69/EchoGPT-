
import { IsEnum, IsString, IsOptional, IsBoolean, IsNotEmpty, MinLength } from 'class-validator';
import { AIProviderType } from '../../generated/prisma/enums.js';


export class CreateProviderDto {
  @IsString()
  @IsNotEmpty()
  name: string;
  @IsEnum(AIProviderType)
  type: AIProviderType;

  @IsString()
  @IsNotEmpty()
 
  apiKey: string;

  @IsOptional()
  @IsString()
  model?: string;

  @IsOptional()
  @IsString()
  baseUrl?: string;

  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}
// src/ai-provider/dto/update-provider.dto.ts
import { PartialType, OmitType } from '@nestjs/mapped-types';
import { CreateProviderDto } from './create-provider.dto.js';


export class UpdateProviderDto extends PartialType(
  OmitType(CreateProviderDto, ['type'] as const),
) {}
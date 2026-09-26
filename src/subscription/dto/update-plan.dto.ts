import { IsEnum } from 'class-validator';
import { PlanType } from '../../generated/prisma/enums.js'; // adjust path to your generated enum location

export class UpdatePlanDto {
  @IsEnum(PlanType)
  plan: PlanType;
}
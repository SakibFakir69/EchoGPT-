import { Body, Controller, Get, HttpCode, Patch, Post, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import { SubscriptionService } from './subscription.service.js';
import { UpdatePlanDto } from './dto/update-plan.dto.js';
import { AuthGuard } from '../auth/auth.guard.js';
import { ResponseMessage } from '../common/decorators/response-message.decorator.js';

interface JwtPayload {
  sub: string;
  email: string;
  role: string;
}

function getUser(request: Request): JwtPayload {
  return request['user'] as unknown as JwtPayload;
}

@UseGuards(AuthGuard)
@Controller('subscription')
export class SubscriptionController {
  constructor(private readonly subscriptionService: SubscriptionService) {}

  @Get('status')
  @ResponseMessage('Subscription status fetched')
  getStatus(@Req() request: Request) {
    return this.subscriptionService.getStatus(getUser(request).sub);
  }

  @Get('remaining-requests')
  @ResponseMessage('Remaining requests fetched')
  getRemaining(@Req() request: Request) {
    return this.subscriptionService.getRemainingRequests(getUser(request).sub);
  }

  @Patch('plan')
  @HttpCode(200)
  @ResponseMessage('Plan updated successfully')
  updatePlan(@Req() request: Request, @Body() dto: UpdatePlanDto) {
    return this.subscriptionService.updatePlan(getUser(request).sub, dto);
  }

  @Post('cancel')
  @HttpCode(200)
  @ResponseMessage('Subscription canceled')
  cancel(@Req() request: Request) {
    return this.subscriptionService.cancel(getUser(request).sub);
  }
}
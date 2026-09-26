import { Body, Controller, Get, HttpCode, Patch, Post, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import { SubscriptionService } from './subscription.service.js';
import { UpdatePlanDto } from './dto/update-plan.dto.js';
import { AuthGuard } from '../auth/auth.guard.js';
import { ResponseMessage } from '../common/decorators/response-message.decorator.js';

@UseGuards(AuthGuard)
@Controller('subscription')
export class SubscriptionController {
  constructor(private readonly subscriptionService: SubscriptionService) {}

  @Get('status')
  @ResponseMessage('Subscription status fetched')

  getStatus(@Req() request: Request) {
    return this.subscriptionService.getStatus(request['user'].sub );
  }

  @Get('remaining-requests')
  @ResponseMessage('Remaining requests fetched')
  getRemaining(@Req() request: Request) {
    
    return this.subscriptionService.getRemainingRequests(request['user'].sub);
  }

  @Patch('plan')
  @HttpCode(200)
  @ResponseMessage('Plan updated successfully')
  updatePlan(@Req() request: Request, @Body() dto: UpdatePlanDto) {
    return this.subscriptionService.updatePlan(request['user'].sub, dto);
  }

  @Post('cancel')
  @HttpCode(200)
  @ResponseMessage('Subscription canceled')
  cancel(@Req() request: Request) {
    return this.subscriptionService.cancel(request['user'].sub);
  }
}
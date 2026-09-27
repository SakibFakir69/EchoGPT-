 import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { UpdatePlanDto } from './dto/update-plan.dto.js';


const PLAN_LIMITS: Record<'FREE' | 'PREMIUM', number> = {
  FREE: 50,
  PREMIUM: 5000,
};

@Injectable()
export class SubscriptionService {

  constructor(private readonly prisma: PrismaService) {}


  private async getOrCreate(userId: string) {
    let subscription = await this.prisma.subscription.findUnique({ where: { userId } });
  
    if (!subscription) {
      subscription = await this.prisma.subscription.create({
        data: { userId, plan: 'FREE', requestLimit: PLAN_LIMITS.FREE },
      });
    }

    return subscription;
  }

  async getStatus(userId: string) {
    const subscription = await this.getOrCreate(userId);

    return {
      plan: subscription.plan,
      status: subscription.status,
      requestLimit: subscription.requestLimit,
      requestsUsed: subscription.requestsUsed,
      remainingRequests: Math.max(subscription.requestLimit - subscription.requestsUsed, 0),
      currentPeriodEnd: subscription.currentPeriodEnd,
    };
  }

  async getRemainingRequests(userId: string) {
    const subscription = await this.getOrCreate(userId);
    return {
      remainingRequests: Math.max(subscription.requestLimit - subscription.requestsUsed, 0),
    };
  }

  async updatePlan(userId: string, dto: UpdatePlanDto) {
    const subscription = await this.getOrCreate(userId);

    return this.prisma.subscription.update({
      where: { userId },
      data: {
        plan: dto.plan,
        requestLimit: PLAN_LIMITS[dto.plan],
        status: 'ACTIVE',
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        canceledAt: null,
      },
    });
  }

  async cancel(userId: string) {
    const subscription = await this.getOrCreate(userId);
    if (!subscription) throw new NotFoundException('Subscription not found');

    return this.prisma.subscription.update({
      where: { userId },
      data: { status: 'CANCELED', canceledAt: new Date() },
    });
  }

  
  async incrementUsage(userId: string) {
    const subscription = await this.getOrCreate(userId);

    if (subscription.requestsUsed >= subscription.requestLimit) {
      throw new Error('Request limit exceeded'); 
    }

    return this.prisma.subscription.update({
      where: { userId },
      data: { requestsUsed: { increment: 1 } },
    });
  }
}
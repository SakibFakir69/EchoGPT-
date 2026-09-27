import { Module } from '@nestjs/common';
import { SubscriptionController } from './subscription.controller.js';
import { SubscriptionService } from './subscription.service.js';
import { PrismaService } from '../prisma/prisma.service.js';

@Module({
  controllers: [SubscriptionController],
  providers: [SubscriptionService,PrismaService],
  exports: [SubscriptionService , PrismaService], 
})
export class SubscriptionModule {}
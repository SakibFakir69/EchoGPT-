import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller.js';
import { AdminService } from './admin.service.js';
import { RolesGuard } from '../common/decorators/roles.decorator.js';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { RequestLogService } from './request-log.service.js';
import { RequestLogInterceptor } from './request-log.interceptor.js';
import { PrismaModule } from '../prisma/prisma.module.js'; // adjust path

@Module({
  imports: [PrismaModule],
  controllers: [AdminController],
  providers: [
    AdminService,
    RolesGuard,
    RequestLogService,
    { provide: APP_INTERCEPTOR, useClass: RequestLogInterceptor },
  ],
})
export class AdminModule {}
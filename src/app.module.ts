import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { createObserveModule } from '@nestjs/observe';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { UsersModule } from './users/users.module.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { AuthModule } from './auth/auth.module.js';
import { ResponseInterceptor } from './common/interceptors/response.interceptor.js';
import { SubscriptionModule } from './subscription/subscription.module.js';
import { LoggerMiddleware } from './common/logger/logger.middleware.js';
import { LoggerInterceptor } from './common/logger/logger.interceptor.js';
import { AiProviderModule } from './ai-provider/ai-provider.module.js';

export const { ObserveModule, ObserveInstrument } = createObserveModule();

@Module({
  imports: [
    UsersModule,
    PrismaModule,
    AuthModule,
    SubscriptionModule,
    AiProviderModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
     {provide:APP_INTERCEPTOR , useClass:LoggerInterceptor},
    { provide: APP_INTERCEPTOR, useClass: ResponseInterceptor }
   
  ],
})

export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LoggerMiddleware)
      .forRoutes('*');  
  }
}
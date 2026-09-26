import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ResponseMessage } from '../decorators/response-message.decorator.js';

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  
  constructor(private reflector: Reflector) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const customMessage = this.reflector.get(ResponseMessage, context.getHandler());

    return next.handle().pipe(
      map((data) => ({
        success: true,
        message: customMessage ?? 'Request successful',
        data: data ?? null,
      })),
    );
  }
}
// admin/request-log.interceptor.ts
import { CallHandler, ExecutionContext, HttpException, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { RequestLogService } from './request-log.service.js';

@Injectable()
export class RequestLogInterceptor implements NestInterceptor {
  constructor(private readonly logs: RequestLogService) {}

  intercept(ctx: ExecutionContext, next: CallHandler): Observable<unknown> {
    const req = ctx.switchToHttp().getRequest();
    const res = ctx.switchToHttp().getResponse();
    const start = Date.now();
    const record = (statusCode: number) =>
      this.logs.add({
        method: req.method,
        path: req.originalUrl,
        statusCode,
        durationMs: Date.now() - start,
        userId: req.user?.sub ?? null,
        timestamp: new Date().toISOString(),
      });

    return next.handle().pipe(
      tap({
        next: () => record(res.statusCode),
        error: (e) => record(e instanceof HttpException ? e.getStatus() : 500),
      }),
    );
  }
}
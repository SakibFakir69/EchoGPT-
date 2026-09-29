import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggerInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();

    console.log(
      `REQ [${req.method}] URL [${req.originalUrl}]`,
    );

    return next.handle().pipe(
      tap(() => {
       
        console.log(`RES [${req.method}] ${req.originalUrl} completed`);
      }),
    );
  }
}
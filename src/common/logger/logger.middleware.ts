
import { Injectable, NestMiddleware } from '@nestjs/common';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  use(req: any, res: any, next: () => void) {
    console.log(` REQ [ ${req.method}] = URL [ ${req.originalUrl}] `)
    next();
  }
}

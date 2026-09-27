import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {

    const request = context.switchToHttp().getRequest();
    
    const token = this.extractToken(request);
    if (!token) {
      throw new UnauthorizedException();
    }
    console.log(token , "token")

    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_ACCESS_SECRET,
      });
      request['user'] = payload;
    } catch(err:any) {
         console.log('JWT verify failed:', err?.message);
      throw new UnauthorizedException();
    }

    return true;
  }

  private extractToken(request: Request): string | undefined {
  
    const cookieToken = request.cookies?.access_token;
    if (cookieToken) return cookieToken;

    const [type, headerToken] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? headerToken : undefined;
  }
}
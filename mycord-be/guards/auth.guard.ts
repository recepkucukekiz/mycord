import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { RequestObject, TokenPayload } from 'req.type';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: RequestObject = context.switchToHttp().getRequest();
    const token =
      request.headers.authorization?.split(' ')[1] || request.cookies?.token;

    if (typeof token === 'string' && token) {
      const tokenPayload = this.jwtService.decode<TokenPayload>(token);

      if (tokenPayload) {
        request.token = tokenPayload;
        return true;
      }
    }
    throw new UnauthorizedException();
  }
}

import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Role } from '@prisma/client';
import { FastifyRequest } from 'fastify';
import { Observable } from 'rxjs';
import { AuthService } from '../auth.service';

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(private authService: AuthService) {}
  canActivate(context: ExecutionContext) {
    const { req }: { req: FastifyRequest } =
      GqlExecutionContext.create(context).getContext();
    try {
      const payload = this.authService.ValidateAccessToken(
        req.cookies.access_token,
        { getPayload: true },
      );
      const role: Role = payload.role;
      // Basic Admin
      if (role == 'ADMIN') {
        return true;
      } else {
        throw new Error('User is not admin');
      }
    } catch (e: any) {
      throw new UnauthorizedException(e.message);
    }
  }
}

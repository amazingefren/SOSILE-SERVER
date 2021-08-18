import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { FastifyReply, FastifyRequest } from 'fastify';
import { AuthService } from '../auth.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const { req }: { req: FastifyRequest; res: FastifyReply } =
      GqlExecutionContext.create(context).getContext();

    try {
      return this.authService.ValidateAccessToken(req.cookies.access_token);
    } catch {
      throw new UnauthorizedException();
    }
  }
}

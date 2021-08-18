import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { FastifyReply, FastifyRequest } from 'fastify';
import { AuthService } from '../auth.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService) {}
  private readonly logger = new Logger('AuthGuard');
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const { req }: { req: FastifyRequest; res: FastifyReply } =
      GqlExecutionContext.create(context).getContext();
    try {
      return this.authService.ValidateAccessToken(req.cookies.access_token);
    } catch (e) {
      this.logger.debug(e);
      throw new UnauthorizedException();
    }
  }
}

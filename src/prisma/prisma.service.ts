import {
  INestApplication,
  Injectable,
  Logger,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Prisma, PrismaClient } from '@prisma/client';
import { DevelopmentConfig } from 'config/configuration';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  constructor(private configService: ConfigService) {
    // super({ errorFormat: 'minimal', log: ['error', 'info', 'query', 'warn'] });
    super({
      errorFormat: 'minimal',
      log: [
        { emit: 'event', level: 'query' },
        { emit: 'stdout', level: 'info' },
        { emit: 'stdout', level: 'warn' },
        { emit: 'stdout', level: 'error' },
      ],
    });
    if (
      configService.get<DevelopmentConfig>('development').logLevel != 'debug'
    ) {
      this.logger.debug = () => {};
    }
  }
  private logger = new Logger('PrismaService');

  async onModuleInit() {
    this.$on<any>('query', (event: Prisma.QueryEvent) => {
      this.logger.debug(
        '\x1B[95mQuery: \x1B[96m' +
          event.query +
          ' \x1B[33m+' +
          event.duration +
          'ms',
      );
    });
    await this.$connect();
  }

  async enableShutdownHook(app: INestApplication) {
    this.$on('beforeExit', async () => {
      await app.close();
    });
  }
}

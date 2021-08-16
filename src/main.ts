import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';
import { ValidationPipe } from '@nestjs/common'


async function bootstrap() {
  // Create NestJS Fastify
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  );

  // Assign Variables
  const configService = app.get(ConfigService);
  const PORT = configService.get('PORT');
  const LOGLEVEL = configService.get('LOG_LEVEL');

  // Initalize Logger
  app.useLogger([LOGLEVEL]);
  const logger = new Logger('Server');

  app.useGlobalPipes(new ValidationPipe({transform: true}))

  // Start Server
  await app.listen(PORT).then(() => {
    logger.log('Started on port: ' + PORT);
  });
}
bootstrap();

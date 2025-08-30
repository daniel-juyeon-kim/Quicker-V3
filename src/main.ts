import { HttpStatus, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {
  setApiDocument,
  setCommonMiddlewares,
} from './core/middleware/set-common-middleware';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      errorHttpStatusCode: HttpStatus.BAD_REQUEST,
    }),
  );
  setApiDocument(app);
  setCommonMiddlewares(app);

  await app.listen(process.env.SERVER_PORT);
}
bootstrap();

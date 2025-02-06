import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { setMiddleware } from './core/middleware/set-middleware';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });

  setMiddleware(app);

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();

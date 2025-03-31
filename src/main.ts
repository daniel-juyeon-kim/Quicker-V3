import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { setCommonMiddlewares } from './core/middleware/set-common-middleware';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      errorHttpStatusCode: HttpStatus.BAD_REQUEST,
    }),
  );
  setCommonMiddlewares(app);
  setApiDocument(app);

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();

const setApiDocument = (app: INestApplication) => {
  const config = new DocumentBuilder()
    .setTitle('Quicker Nest Server API')
    .setDescription('Quicker nestjs API 문서')
    .setVersion('1.0')
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory);
};

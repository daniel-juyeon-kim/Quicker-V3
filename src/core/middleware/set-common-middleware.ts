import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import compression from 'compression';
import helmet from 'helmet';

export const setApiDocument = (app: INestApplication) => {
  const config = new DocumentBuilder()
    .setTitle('Quicker Nest Server API')
    .setDescription('Quicker nestjs API 문서')
    .setVersion('1.0')
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory);
};

export const setCommonMiddlewares = (app: INestApplication) => {
  const middlewares = [compression(), helmet()];

  app.use(...middlewares);
};

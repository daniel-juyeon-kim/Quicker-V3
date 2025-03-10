import { INestApplication } from '@nestjs/common';
import compression from 'compression';
import helmet from 'helmet';

export const setCommonMiddlewares = (app: INestApplication) => {
  const middlewares = [compression(), helmet()];

  app.use(...middlewares);
};

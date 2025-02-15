import { ExternalApiException, UnknownException } from '@src/core/module';
import { DataBaseException } from '@src/database';

export type ExceptionTypes =
  | DataBaseException
  | ExternalApiException
  | UnknownException;

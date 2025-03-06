import { DataBaseException } from '@src/core/exception';
import { UnknownDataBaseException } from '@src/core/exception/database/unknown-database.exception';

export type DataBaseExceptions =
  | typeof DataBaseException
  | typeof UnknownDataBaseException;

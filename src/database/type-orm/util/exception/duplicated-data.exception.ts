import { DataBaseException } from './database.exception';

export class DuplicatedDataException extends DataBaseException {
  constructor(message: string) {
    super(message);
  }
}

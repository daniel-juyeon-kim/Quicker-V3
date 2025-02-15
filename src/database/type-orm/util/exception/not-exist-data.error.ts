import { DataBaseException } from './database.exception';

export class NotExistDataException extends DataBaseException {
  constructor(message: string) {
    super(message);
  }
}

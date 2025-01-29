import { DataBaseError } from "./database.error";

export class NotExistDataError extends DataBaseError {
  constructor(message: string) {
    super(message);
  }
}

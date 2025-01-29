import { DataBaseError } from "./database.error";

export class DuplicatedDataError extends DataBaseError {
  constructor(message: string) {
    super(message);
  }
}

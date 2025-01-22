import { ErrorMessage } from "./error-message";

export interface ErrorMessageBot {
  sendMessage(message: ErrorMessage<unknown>): Promise<void>;
}

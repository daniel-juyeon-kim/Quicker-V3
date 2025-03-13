import { AbstractUnknownException } from './unknown.exception';

export interface UnknownExceptionConstructor {
  new (...args: any): AbstractUnknownException<any>;
}

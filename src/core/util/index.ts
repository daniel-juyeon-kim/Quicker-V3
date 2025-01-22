import { Response } from 'node-fetch';

const ZERO = 0;
export type ExcludeEmptyString = Exclude<string, ''>;

export const isUndefined = (value: unknown): value is undefined => {
  return value === undefined;
};

export const isNull = (value: unknown) => {
  return value === null;
};

export const isNumber = (
  value: number,
): value is Exclude<number, typeof NaN | typeof Infinity> => {
  return Number.isFinite(value);
};

export const isPositiveNumber = (value: number) => {
  return isNumber(value) && isPositive(value);
};

const isPositive = (value: number) => {
  return ZERO < value;
};

export const isString = (value: unknown): value is string => {
  return typeof value === 'string';
};

export const isEmptyString = (value: string): value is '' => {
  return value === '';
};

export const isFulfilled = <T>(
  promise: PromiseSettledResult<T>,
): promise is PromiseFulfilledResult<T> => {
  return promise.status === 'fulfilled';
};

export const validateResponse = async (response: Response) => {
  if (isOK(response.status)) {
    return;
  }
  throw await response.json();
};

const isOK = (responseStatus: Response['status']) => {
  const OK_CODE = 200;
  return responseStatus === OK_CODE;
};

export const validateNumeric = (value: string | number) => {
  const ERROR_INVALID_NUMBER = `${value}는 유효한 정수가 아닙니다.`;

  if (isString(value)) {
    validateNumber(parseInt(value), ERROR_INVALID_NUMBER);
    return;
  }
  validateNumber(value, ERROR_INVALID_NUMBER);
};

const validateNumber = (value: number, errorMessage: string) => {
  if (isNumber(value)) {
    return;
  }
  throw new Error(errorMessage);
};

export const validateNotZero = (value: number) => {
  const ERROR_VALUE_IS_ZERO = '값이 0입니다.';

  if (isZero(value)) {
    throw new Error(ERROR_VALUE_IS_ZERO);
  }
};

const isZero = (value: number) => {
  return value === ZERO;
};

export const isEmptyArray = (array: Array<unknown>) => {
  return isZero(array.length);
};

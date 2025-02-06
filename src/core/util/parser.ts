import { validateNumeric } from '.';

const SPLITTER = ',';

/**
 * @param value "1,2,3"
 * @returns [1,2,3]
 * @throws `${value}는 유효한 정수가 아닙니다.`
 */
export const parseNumericStringToNumberList = (value: string) => {
  value.split(SPLITTER).forEach(validateNumeric);

  return value.split(SPLITTER).map((n) => parseInt(n));
};

import { isNull } from '.';

/**
 * 객체의 속성중 null이 있는지 확인하는 함수
 * @param obj 객체
 * @returns boolean
 */
export const hasAttributeNull = <T extends object>(obj: T) => {
  for (const key in obj) {
    if (isNull(obj[key])) {
      return true;
    }
  }
  return false;
};

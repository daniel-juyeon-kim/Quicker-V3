import { isUndefined, validateNumeric } from '.';

const DISTANCES = [5, 10, 15, 20, 25, 30, 40, 50, 60] as const;

type DistanceElementIntersection = (typeof DISTANCES)[number];
type Over60KM = '60+KM';
type DistanceKeys = `${DistanceElementIntersection}KM` | Over60KM;

export const findDistanceKey = (km: number): DistanceKeys => {
  validateNumeric(km);

  const distance = DISTANCES.find((DISTANCE) => {
    return km <= DISTANCE;
  });

  if (isUndefined(distance)) {
    return '60+KM';
  }
  return `${distance}KM`;
};

export const createLastMonthRange = (date: Date) => {
  const start = new Date(date.getFullYear(), date.getMonth() - 1, 1);
  const end = new Date(date.getFullYear(), date.getMonth(), 0, 23, 59, 59, 999);

  return { start, end };
};

export const createLastMonth = (now: Date) => {
  return new Date(now.getFullYear(), now.getMonth() - 1);
};

export const createFirstDateOfCurrentMonth = (now: Date) => {
  return new Date(now.getFullYear(), now.getMonth(), 1);
};

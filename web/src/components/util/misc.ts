export const toArray = <T>(value: T | T[]): T[] => {
  if (Array.isArray(value)) return value;
  if (value === undefined) return [];
  return [value];
};

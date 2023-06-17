export const toArray = <T>(value: T): T extends unknown[] ? T : T extends undefined ? [] : T[] => {
  // @ts-expect-error bruh
  if (Array.isArray(value)) return value;
  // @ts-expect-error bruh
  if (value === undefined) return [];
  // @ts-expect-error bruh
  return [value];
};

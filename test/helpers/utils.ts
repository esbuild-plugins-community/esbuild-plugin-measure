type TypeEntries<T> = Array<
  {
    [K in keyof T]: [K, T[K]];
  }[keyof T]
>;

export function delay(d: number) {
  return new Promise((resolve) => setTimeout(resolve, d));
}

export const getTypedEntries = Object.entries as <T extends Record<string, any>>(
  obj: T
) => TypeEntries<T>;

export const DELAYS: Record<'onStart' | 'onLoad' | 'onResolve' | 'onEnd' | 'setup', number> = {
  setup: 4,
  onStart: 5,
  onResolve: 6,
  onLoad: 7,
  onEnd: 8,
};

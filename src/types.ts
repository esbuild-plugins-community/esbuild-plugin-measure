export type TypeOptions = {
  logToConsole?: boolean;
  logToFile?: string;
};

export type TypeEvents = 'onStart' | 'onLoad' | 'onResolve' | 'onEnd' | 'setup';

export type TypeMetrics = Record<
  string,
  {
    duration: number;
    events: Record<Partial<TypeEvents>, Array<number>>;
  }
>;

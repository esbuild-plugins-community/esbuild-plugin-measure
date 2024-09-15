export type TypeOptions = {
  logToConsole?: boolean;
  onMetricsReady?: (metrics: TypeMetrics) => void;
};

export type TypeEvents = 'onStart' | 'onLoad' | 'onResolve' | 'onEnd' | 'setup';

type TypePluginName = string;

export type TypePluginMetrics = {
  duration: number;
  hooks: Record<
    Partial<TypeEvents>,
    {
      duration: number;
      iterations: number;
      start: number;
    }
  >;
};

export type TypeMetrics = {
  duration: number;
  plugins: Record<TypePluginName, TypePluginMetrics>;
};

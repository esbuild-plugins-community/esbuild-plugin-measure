export type TypeOptions = {
  logToConsole?: boolean;
  onMetricsReady?: (metrics: TypeMetrics) => void;
};

export type TypeHooks = 'onStart' | 'onLoad' | 'onResolve' | 'onEnd' | 'setup';

type TypePluginName = string;

export type TypeHookMetrics = {
  hookDuration: number;
  iterations: number;
  hookStart: number;
};

export type TypePluginMetrics = {
  pluginDuration: number;
  pluginStart: number;
  hooks: Record<Partial<TypeHooks>, TypeHookMetrics>;
};

export type TypeMetrics = {
  totalDuration: number;
  totalStart: number;
  plugins: Record<TypePluginName, TypePluginMetrics>;
};

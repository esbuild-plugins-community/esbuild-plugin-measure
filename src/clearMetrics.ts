import { TypeHooks, TypeMetrics } from './types.js';

export function clearMetrics(metrics: TypeMetrics) {
  metrics.totalDuration = 0;
  metrics.totalStart = 0;

  Object.values(metrics.plugins).forEach((metric) => {
    metric.pluginDuration = 0;
    metric.pluginStart = 0;

    Object.keys(metric.hooks).forEach((key) => {
      metric.hooks[key as TypeHooks] = { iterations: 0, hookDuration: 0, hookStart: 0 };
    });

    // @ts-ignore
    delete metric.hooks.setup;
  });
}

import { TypeEvents, TypeMetrics } from './types.js';

export function clearMetrics(metrics: TypeMetrics) {
  metrics.duration = 0;

  Object.values(metrics.plugins).forEach((metric) => {
    metric.duration = 0;

    Object.keys(metric.hooks).forEach((key) => {
      metric.hooks[key as TypeEvents] = { iterations: 0, duration: 0, start: 0 };
    });

    // @ts-ignore
    delete metric.hooks.setup;
  });
}

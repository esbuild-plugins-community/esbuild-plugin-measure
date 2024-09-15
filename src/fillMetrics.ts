import { TypeMetrics } from './types.js';

export function fillMetrics(metrics: TypeMetrics) {
  Object.values(metrics.plugins).forEach((pluginMetrics) => {
    pluginMetrics.duration += pluginMetrics.hooks.setup?.duration || 0;
    pluginMetrics.duration += pluginMetrics.hooks.onStart?.duration || 0;
    pluginMetrics.duration += pluginMetrics.hooks.onEnd?.duration || 0;
    pluginMetrics.duration += Math.max(
      pluginMetrics.hooks.onResolve?.duration || 0,
      pluginMetrics.hooks.onLoad?.duration || 0
    );

    metrics.duration += pluginMetrics.hooks.setup?.duration || 0;
    metrics.duration += pluginMetrics.hooks.onStart?.duration || 0;
    metrics.duration += pluginMetrics.hooks.onEnd?.duration || 0;
  });

  const maxAsyncDuration = Math.max(
    ...Object.values(metrics.plugins).map((pluginMetrics) =>
      Math.max(
        pluginMetrics.hooks.onResolve?.duration || 0,
        pluginMetrics.hooks.onLoad?.duration || 0
      )
    )
  );

  metrics.duration += maxAsyncDuration;
}

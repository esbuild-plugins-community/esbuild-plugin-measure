import { Plugin } from 'esbuild';

import { TypeMetrics, TypePluginMetrics } from './types.js';

export function createPluginMetrics(metrics: TypeMetrics, plugin: Plugin): TypePluginMetrics {
  let pluginMetricsName = plugin.name;

  let i = 1;

  while (metrics.plugins[pluginMetricsName]) {
    // eslint-disable-next-line no-plusplus
    pluginMetricsName = `${plugin.name} (${++i})`;
  }

  metrics.plugins[pluginMetricsName] = {
    pluginDuration: 0,
    hooks: {} as any,
    pluginStart: 0,
  };

  return metrics.plugins[pluginMetricsName];
}

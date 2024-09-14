import { Plugin } from 'esbuild';

import { TypeMetrics } from './types.js';

export function createPluginMetrics(metrics: TypeMetrics, plugin: Plugin) {
  let pluginMetricsName = plugin.name;

  let i = 1;

  while (metrics[pluginMetricsName]) {
    // eslint-disable-next-line no-plusplus
    pluginMetricsName = `${plugin.name} (${++i})`;
  }

  metrics[pluginMetricsName] = { duration: 0, events: {} as any };

  return metrics[pluginMetricsName];
}

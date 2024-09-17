import { performance } from 'node:perf_hooks';

import { TypeHooks, TypeMetrics, TypePluginMetrics } from './types.js';

// eslint-disable-next-line max-params
export function createHookCallback(
  metrics: TypeMetrics,
  detector: { onEndExecuting: boolean },
  pluginMetrics: TypePluginMetrics,
  hookName: TypeHooks,
  cb: any
) {
  pluginMetrics.hooks[hookName] ??= { iterations: 0, hookDuration: 0, hookStart: 0 };

  return async function call(...args: Array<any>) {
    if (!metrics.totalStart) {
      metrics.totalStart = performance.now();
    }
    if (!pluginMetrics.pluginStart) pluginMetrics.pluginStart = performance.now();

    if (hookName === 'onEnd') {
      detector.onEndExecuting = true;
    }

    if (!pluginMetrics.hooks[hookName].hookStart) {
      pluginMetrics.hooks[hookName].hookStart = performance.now();
    }

    try {
      return await cb(...args);
    } finally {
      if (hookName === 'onEnd') {
        detector.onEndExecuting = false;
      }

      const end = performance.now();

      pluginMetrics.hooks[hookName].iterations += 1;
      pluginMetrics.hooks[hookName].hookDuration = Math.max(
        pluginMetrics.hooks[hookName].hookDuration,
        end - pluginMetrics.hooks[hookName].hookStart
      );

      metrics.totalDuration = Math.max(metrics.totalDuration, end - metrics.totalStart);
      pluginMetrics.pluginDuration = Math.max(
        pluginMetrics.pluginDuration,
        end - pluginMetrics.pluginStart
      );
    }
  };
}

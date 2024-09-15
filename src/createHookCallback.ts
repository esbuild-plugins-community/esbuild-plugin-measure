import { performance } from 'node:perf_hooks';

import { TypeEvents, TypePluginMetrics } from './types.js';

// eslint-disable-next-line max-params
export function createHookCallback(
  detector: { onEndExecuting: boolean },
  pluginMetrics: TypePluginMetrics,
  hookName: TypeEvents,
  cb: any
) {
  pluginMetrics.hooks[hookName] ??= { iterations: 0, duration: 0, start: 0 };

  return async function call(...args: Array<any>) {
    if (hookName === 'onEnd') {
      detector.onEndExecuting = true;
    }

    if (!pluginMetrics.hooks[hookName].start) {
      pluginMetrics.hooks[hookName].start = performance.now();
    }

    try {
      return await cb(...args);
    } finally {
      if (hookName === 'onEnd') {
        detector.onEndExecuting = false;
      }

      pluginMetrics.hooks[hookName].iterations += 1;
      pluginMetrics.hooks[hookName].duration = Math.max(
        pluginMetrics.hooks[hookName].duration,
        performance.now() - pluginMetrics.hooks[hookName].start
      );
    }
  };
}

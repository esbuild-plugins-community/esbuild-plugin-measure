import { performance } from 'node:perf_hooks';

import { TypeEvents, TypeMetrics } from './types.js';

// eslint-disable-next-line max-params
export function createHookCallback(
  detector: { onEndExecuting: boolean },
  pluginMetrics: TypeMetrics[keyof TypeMetrics],
  hookName: TypeEvents,
  cb: any
) {
  pluginMetrics.events[hookName] ??= [];

  return async function call(...args: Array<any>) {
    if (hookName === 'onEnd') {
      detector.onEndExecuting = true;
    }

    const start = performance.now();

    try {
      return await cb(...args);
    } finally {
      if (hookName === 'onEnd') {
        detector.onEndExecuting = false;
      }

      const duration = performance.now() - start;

      pluginMetrics.events[hookName].push(duration);
      pluginMetrics.duration += duration;
    }
  };
}

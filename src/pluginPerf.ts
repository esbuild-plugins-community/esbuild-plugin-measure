import { Plugin } from 'esbuild';

import { validateOptions } from './validators/validateOptions.js';
import { logInterval, pluginName } from './constants.js';
import { TypeMetrics, TypeOptions } from './types.js';
import { wrapPlugins } from './wrapPlugins.js';
import { logToConsole } from './loggers.js';
import { fillMetrics } from './fillMetrics.js';
import { clearMetrics } from './clearMetrics.js';

export const pluginPerf = (options?: TypeOptions): Plugin => {
  validateOptions(options);

  const finalOptions: TypeOptions = {
    onMetricsReady: options?.onMetricsReady,
    logToConsole: options?.logToConsole ?? true,
  };

  return {
    name: pluginName,
    setup: (build) => {
      const metrics: TypeMetrics = { duration: 0, plugins: {} };
      const detector: { onEndExecuting: boolean } = { onEndExecuting: false };

      wrapPlugins(detector, metrics, build);

      build.onEnd(() => {
        const interval = setInterval(() => {
          if (!detector.onEndExecuting) {
            clearInterval(interval);
            fillMetrics(metrics);

            if (finalOptions.logToConsole) logToConsole(metrics);

            finalOptions.onMetricsReady?.(JSON.parse(JSON.stringify(metrics)));

            clearMetrics(metrics);
          }
        }, logInterval);
      });
    },
  };
};

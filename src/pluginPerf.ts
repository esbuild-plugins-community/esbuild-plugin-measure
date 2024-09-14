import { Plugin } from 'esbuild';

import { validateOptions } from './validators/validateOptions.js';
import { pluginName } from './constants.js';
import { TypeEvents, TypeMetrics, TypeOptions } from './types.js';
import { wrapPlugins } from './wrapPlugins.js';
import { logToConsole, logToFile } from './loggers.js';

export const pluginPerf = (options?: TypeOptions): Plugin => {
  validateOptions(options);

  const finalOptions: TypeOptions = {
    logToFile: options?.logToFile,
    logToConsole: options?.logToConsole ?? true,
  };

  return {
    name: pluginName,
    setup: (build) => {
      const metrics: TypeMetrics = {};
      const detector: { onEndExecuting: boolean } = { onEndExecuting: false };

      wrapPlugins(detector, metrics, build);

      build.onEnd(() => {
        const interval = setInterval(() => {
          if (!detector.onEndExecuting) {
            clearInterval(interval);

            if (finalOptions.logToConsole) logToConsole(metrics);
            if (finalOptions.logToFile) logToFile(metrics, finalOptions.logToFile);

            Object.values(metrics).forEach((metric) => {
              metric.duration = 0;

              Object.keys(metric.events).forEach((key) => {
                metric.events[key as TypeEvents] = [];
              });
            });
          }
          // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        }, 5);
      });
    },
  };
};

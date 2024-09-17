import { PluginBuild } from 'esbuild';

import { pluginName } from './constants.js';
import { TypeHooks, TypeMetrics } from './types.js';
import { createHookCallback } from './createHookCallback.js';
import { createPluginMetrics } from './createPluginMetrics.js';

const hooks: Array<Exclude<TypeHooks, 'setup'>> = ['onStart', 'onLoad', 'onResolve', 'onEnd'];

export const wrapPlugins = (
  detector: { onEndExecuting: boolean },
  metrics: TypeMetrics,
  initialBuild: PluginBuild
) => {
  const plugins = initialBuild.initialOptions.plugins!;
  const initialPlugins = plugins.map((plugin) => ({ ...plugin }));

  for (const plugin of plugins) {
    if (plugin.name === pluginName) continue;

    const initialSetup = plugin.setup;

    plugin.setup = async (pluginBuild) => {
      const newBuildObject: any = Object.assign({}, pluginBuild);

      const pluginMetrics = createPluginMetrics(metrics, plugin);

      for (const hookName of hooks) {
        newBuildObject[hookName] = async (...hookArgs: Array<any>) => {
          const hookCallback = createHookCallback(
            metrics,
            detector,
            pluginMetrics,
            hookName,
            hookArgs[1] || hookArgs[0]
          );

          if (hookName === 'onLoad' || hookName === 'onResolve') {
            return pluginBuild[hookName](hookArgs[0], hookCallback);
          }

          return pluginBuild[hookName](hookCallback);
        };
      }

      const setupCallback = createHookCallback(
        metrics,
        detector,
        pluginMetrics,
        'setup',
        initialSetup
      );

      await setupCallback({
        ...newBuildObject,
        initialOptions: { ...newBuildObject.initialOptions, plugins: initialPlugins },
      });
    };
  }
};

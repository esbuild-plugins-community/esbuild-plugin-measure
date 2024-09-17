## @espcom/esbuild-plugin-perf

[![npm](https://img.shields.io/npm/v/@espcom/esbuild-plugin-perf)](https://www.npmjs.com/package/@espcom/esbuild-plugin-perf)
![coverage](https://github.com/esbuild-plugins-community/esbuild-plugin-perf/blob/main/assets/coverage.svg)
![size-esm](https://github.com/esbuild-plugins-community/esbuild-plugin-perf/blob/main/assets/esm.svg)
![size-cjs](https://github.com/esbuild-plugins-community/esbuild-plugin-perf/blob/main/assets/cjs.svg)

A performance tracking plugin for esbuild that monitors and logs the time taken by various 
plugin hooks (`onStart`, `onLoad`, `onResolve`, `onEnd`). This plugin helps developers gain 
insights into the performance of esbuild plugins.

## Features

- Measures the duration of esbuild plugin hooks.
- Logs performance metrics to the console or gives a ready object to the callback.
- Provides detailed breakdowns of hook executions for each plugin.
- Supports `build`, `rebuild` and `watch` modes.
- Supports measuring of several plugin instances.

## Installation

You can install this plugin via npm:

```bash
npm install @espcom/esbuild-plugin-perf --save-dev
```

## Usage

To use the plugin in your esbuild configuration, import it and add it to your `plugins` array.
It should be placed **first** to work correctly:

```typescript
import path from 'node:path';
import esbuild from 'esbuild';
import { pluginPerf, TypeMetrics } from '@espcom/esbuild-plugin-perf';

esbuild.build({
  entryPoints: ['src/index.ts'],
  outfile: 'dist/index.js',
  bundle: true,
  plugins: [
    pluginPerf({
      logToConsole: true, // logs metrics to console
      onMetricsReady: (metrics: TypeMetrics) => {
        // maybe save to file
      }
    }),
    ... other plugins
  ],
});
```

### Options

- `logToConsole`: (boolean optional) Logs the performance metrics to the console. Default is `true`.
- `onMetricsReady`: (function optional) A function with a `metrics` argument

### Example Console Output

```
Plugins from first hook execution to last took 618.40 ms

[@espcom/esbuild-plugin-replace] 
  ▶ setup: 1 execution took 1.19 ms
  ▶ onLoad: 518 executions took 318.59 ms
[sass-plugin] 
  ▶ setup: 1 execution took 8.49 ms
  ▶ onStart: 1 execution took 0.41 ms
  ▶ onLoad: 1 execution took 194.64 ms
[sass-plugin (2)] 
  ▶ setup: 1 execution took 6.88 ms
  ▶ onStart: 1 execution took 0.40 ms
  ▶ onResolve: 42 executions took 193.71 ms
  ▶ onLoad: 84 executions took 285.19 ms
[@espcom/esbuild-plugin-inject-preload] 
  ▶ setup: 1 execution took 0.23 ms
  ▶ onEnd: 1 execution took 9.77 ms
```

### Example Raw Metrics Output

```json
{
  "totalDuration": 621.983111,
  "totalStart": 1345.362638,
  "plugins": {
    "@espcom/esbuild-plugin-replace": {
      "pluginDuration": 366.9812840000002,
      "hooks": {
        "setup": {
          "iterations": 1,
          "hookDuration": 1.1948409999999967,
          "hookStart": 1345.368939
        },
        "onLoad": {
          "iterations": 518,
          "hookDuration": 344.0909780000002,
          "hookStart": 1368.257502
        }
      },
      "pluginStart": 1345.367196
    },
    "sass-plugin": {
      "pluginDuration": 335.0744480000001,
      "hooks": {
        "setup": {
          "iterations": 1,
          "hookDuration": 7.800380000000132,
          "hookStart": 1346.593385
        },
        "onStart": {
          "iterations": 1,
          "hookDuration": 0.368748000000096,
          "hookStart": 1364.603021
        },
        "onLoad": {
          "iterations": 1,
          "hookDuration": 297.23064,
          "hookStart": 1384.436522
        }
      },
      "pluginStart": 1346.592714
    },
    "@espcom/esbuild-plugin-inject-preload": {
      "pluginDuration": 606.655913,
      "hooks": {
        "setup": {
          "iterations": 1,
          "hookDuration": 0.22916800000007242,
          "hookStart": 1360.690728
        },
        "onEnd": {
          "iterations": 1,
          "hookDuration": 9.544465000000173,
          "hookStart": 1957.801284
        }
      },
      "pluginStart": 1360.689836
    }
  }
}
```

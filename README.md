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
Plugins (in parallel) took 355.25 ms

[@espcom/esbuild-plugin-replace] took 332.67 ms
  ▶ setup: 1 execution took 0.25 ms
  ▶ onLoad: 518 executions took 332.41 ms
[sass-plugin] took 281.24 ms
  ▶ setup: 1 execution took 6.71 ms
  ▶ onStart: 1 execution took 0.04 ms
  ▶ onLoad: 1 execution took 274.49 ms
[sass-plugin (2)] took 302.19 ms
  ▶ setup: 1 execution took 5.23 ms
  ▶ onStart: 1 execution took 0.03 ms
  ▶ onResolve: 42 executions took 217.99 ms
  ▶ onLoad: 84 executions took 296.93 ms
[@espcom/esbuild-plugin-inject-preload] took 10.32 ms
  ▶ setup: 1 execution took 0.22 ms
  ▶ onEnd: 1 execution took 10.10 ms
```

### Example Raw Metrics Output

```json
{
  "duration": 308.14735200000007,
  "plugins": {
    "plugin-test-all": {
      "duration": 253.366342,
      "hooks": {
        "setup": {
          "iterations": 1,
          "duration": 4.209176999999983,
          "start": 149.894539
        },
        "onStart": {
          "iterations": 1,
          "duration": 5.490779000000003,
          "start": 180.251755
        },
        "onResolve": {
          "iterations": 8,
          "duration": 233.75613800000002,
          "start": 187.122189
        },
        "onLoad": {
          "iterations": 8,
          "duration": 235.042409,
          "start": 212.961732
        },
        "onEnd": {
          "iterations": 1,
          "duration": 8.623977000000025,
          "start": 469.919069
        }
      }
    },
    "plugin-test-onstart": {
      "duration": 9.782200000000017,
      "hooks": {
        "setup": {
          "iterations": 1,
          "duration": 4.306949000000003,
          "start": 167.535588
        },
        "onStart": {
          "iterations": 1,
          "duration": 5.475251000000014,
          "start": 180.389141
        }
      }
    },
  }
}
```

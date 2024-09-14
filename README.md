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
- Logs performance metrics to the console or a file.
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
import { pluginPerf } from '@espcom/esbuild-plugin-perf';

esbuild.build({
  entryPoints: ['src/index.ts'],
  outfile: 'dist/index.js',
  bundle: true,
  plugins: [
    pluginPerf({
      logToConsole: true, // logs metrics to console
      logToFile: path.resolve('metrics.json') // logs metrics to a file
    }),
    ... other plugins
  ],
});
```

### Options

- `logToConsole`: (boolean optional) Logs the performance metrics to the console. Default is `true`.
- `logToFile`: (string optional) Path to the file where metrics should be logged. 
If not provided, metrics will not be written to a file.

### Example Console Output

```
[@my-plugin] took 124.54 ms
  ▶ setup: 1 execution took 4.94 ms
  ▶ onStart: 1 execution took 5.37 ms
  ▶ onResolve: 8 executions took 49.77 ms
  ▶ onLoad: 8 executions took 57.37 ms
  ▶ onEnd: 1 execution took 8.21 ms
```

### Example File Output (JSON)

```json
{
  "@my-plugin": {
    "duration": 120.3,
    "events": {
      "onLoad": [30.5, 20.1, 29.4],
      "onResolve": [40.3]
    }
  }
}
```

Read file with typings:

```typescript
import fs from 'node:fs';
import path from 'node:path';
import esbuild from 'esbuild';
import { pluginPerf, TypeMetrics } from '@espcom/esbuild-plugin-perf';

await esbuild.build({
  plugins: [pluginPerf({ logToFile: path.resolve('metrics.json') })],
});

// The file is written asynchronously, so setTimeout is necessary here

setTimeout(() => {
    const metrics: TypeMetrics = JSON.parse(fs.readFileSync(path.resolve('metrics.json'), 'utf-8'));
}, 10)
```

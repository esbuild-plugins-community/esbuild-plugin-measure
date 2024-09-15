import { describe, it } from 'node:test';
import * as assert from 'node:assert/strict';

import { pluginPerf } from '../src/index.js';

const nonObjects = [0, true, null, '', [], () => false];
const nonBoolean = [0, null, [], () => false, {}, ''];
const nonFunctions = [0, null, [], true, {}, ''];

void describe('Validate options', async () => {
  await it('options should be an object or undefined', () => {
    assert.doesNotThrow(() => pluginPerf());
    assert.doesNotThrow(() => pluginPerf({}));

    nonObjects.forEach((value: any) => {
      assert.throws(() => pluginPerf(value), {
        message: '@espcom/esbuild-plugin-perf: Options must be a plain object',
      });
    });
  });

  await it('options.logToConsole should be a full string or undefined', () => {
    assert.doesNotThrow(() => pluginPerf({ logToConsole: true }));
    assert.doesNotThrow(() => pluginPerf({ logToConsole: false }));

    nonBoolean.forEach((value: any) => {
      assert.throws(() => pluginPerf({ logToConsole: value }), {
        message: '@espcom/esbuild-plugin-perf: The "logToConsole" parameter must be a boolean',
      });
    });
  });

  await it('options.onMetricsReady should be a function or undefined', () => {
    assert.doesNotThrow(() => pluginPerf({ onMetricsReady: undefined }));
    assert.doesNotThrow(() => pluginPerf({ onMetricsReady: () => null }));

    nonFunctions.forEach((value: any) => {
      assert.throws(() => pluginPerf({ onMetricsReady: value }), {
        message: '@espcom/esbuild-plugin-perf: The "onMetricsReady" parameter must be a function',
      });
    });
  });
});

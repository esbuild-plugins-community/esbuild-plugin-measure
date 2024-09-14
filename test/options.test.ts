import { describe, it } from 'node:test';
import * as assert from 'node:assert/strict';

import { pluginPerf } from '../src/index.js';

const nonObjects = [0, true, null, '', [], () => false];
const nonStrings = [0, true, null, [], () => false, {}];
const nonBoolean = [0, null, [], () => false, {}, ''];

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

  await it('options.logToFile should be a full string or undefined', () => {
    assert.doesNotThrow(() => pluginPerf({ logToFile: undefined }));
    assert.doesNotThrow(() => pluginPerf({ logToFile: '1' }));
    assert.throws(() => pluginPerf({ logToFile: '' }), {
      message: '@espcom/esbuild-plugin-perf: The "logToFile" parameter must be a non-empty string',
    });

    nonStrings.forEach((value: any) => {
      assert.throws(() => pluginPerf({ logToFile: value }), {
        message: '@espcom/esbuild-plugin-perf: The "logToFile" parameter must be a string',
      });
    });
  });
});

/* eslint-disable @typescript-eslint/no-magic-numbers */

import * as fs from 'node:fs';
import * as path from 'node:path';
import * as assert from 'node:assert/strict';
import { afterEach, describe, it } from 'node:test';

import { build, BuildOptions, context } from 'esbuild';

import { pluginPerf, TypeEvents, TypeMetrics } from '../src/index.js';
import { TypeOptions } from '../src/types.js';

import {
  pluginNoEnd,
  pluginLogEnd,
  pluginNoHooks,
  pluginOnStart,
  pluginAllHooks,
  pluginLogStart,
  pluginNoEndOnload,
} from './helpers/plugins.js';
import { delay, getTypedEntries, DELAYS } from './helpers/utils.js';

function testTimings(timings: TypeMetrics, pName: string, h: Array<TypeEvents>) {
  const hooks = timings.plugins[pName].hooks;

  getTypedEntries(DELAYS).forEach(([hookName]) => {
    if (!h.includes(hookName)) {
      assert.equal(typeof hooks[hookName] === 'undefined', true, `${hookName} should not exist`);
    } else {
      assert.equal(typeof hooks[hookName] === 'object', true, `${hookName} should be an object`);
      assert.equal(
        hooks[hookName].iterations === (hookName === 'onResolve' || hookName === 'onLoad' ? 8 : 1),
        true,
        `${hookName} iterations`
      );
    }
  });

  getTypedEntries(DELAYS).forEach(([hookName, defaultDuration]) => {
    if (!h.includes(hookName)) return;

    const { duration, iterations } = hooks[hookName];

    const minDuration = defaultDuration * iterations - 1;

    assert.equal(
      duration > minDuration,
      true,
      `${hookName} duration should be more than ${minDuration} but it is ${duration}`
    );
  });
}

void describe('Plugin test', async () => {
  const pathRes = path.resolve('test/res');
  const pathTemp = path.resolve('test/tmp');

  if (!fs.existsSync(pathTemp)) {
    fs.mkdirSync(pathTemp);
  }

  afterEach(() => {
    fs.readdirSync(pathTemp).forEach((file) => {
      fs.unlinkSync(path.resolve(pathTemp, file));
    });

    fs.writeFileSync(
      path.resolve(pathRes, 'modifierAll.tsx'),
      `import './global.css';

export const test = __dirname;
`,
      'utf-8'
    );

    // eslint-disable-next-line no-console
    console.log('\n***\n');
  });

  const getConfig = (onMetricsReady: TypeOptions['onMetricsReady']): BuildOptions => ({
    bundle: true,
    format: 'esm',
    logLevel: 'silent',
    outdir: pathTemp,
    target: 'chrome120',
    platform: 'browser',
    metafile: true,
    write: false,
    resolveExtensions: ['.ts'],
    entryPoints: [path.resolve(pathRes, `modifierAll.tsx`)],
    packages: 'external',
    loader: {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      '.woff': 'file',
      // eslint-disable-next-line @typescript-eslint/naming-convention
      '.woff2': 'file',
      // eslint-disable-next-line @typescript-eslint/naming-convention
      '.ttf': 'file',
    },
    plugins: [
      pluginLogStart(),
      pluginPerf({ onMetricsReady, logToConsole: true }),
      pluginAllHooks(),
      pluginAllHooks(),
      pluginNoEnd(),
      pluginNoEndOnload(),
      pluginOnStart(),
      pluginNoHooks(),
      pluginLogEnd(),
    ],
  });

  await it('works in build mode', async () => {
    await build(
      getConfig((metrics) => {
        testTimings(metrics, 'plugin-test-all', [
          'setup',
          'onStart',
          'onResolve',
          'onLoad',
          'onEnd',
        ]);
        testTimings(metrics, 'plugin-test-all (2)', [
          'setup',
          'onStart',
          'onResolve',
          'onLoad',
          'onEnd',
        ]);
        testTimings(metrics, 'plugin-test-no-end', ['setup', 'onStart', 'onResolve', 'onLoad']);
        testTimings(metrics, 'plugin-test-no-end-onload', ['setup', 'onStart', 'onResolve']);
        testTimings(metrics, 'plugin-test-onstart', ['setup', 'onStart']);
        testTimings(metrics, 'plugin-test-no-hooks', ['setup']);
      })
    );
  });

  await it('works in rebuild mode', async () => {
    let lastMetrics: TypeMetrics | undefined;

    const ctx = await context(
      getConfig((metrics) => {
        if (lastMetrics) {
          assert.notEqual(JSON.stringify(lastMetrics), JSON.stringify(metrics));

          testTimings(metrics, 'plugin-test-all', ['onStart', 'onResolve', 'onLoad', 'onEnd']);
          testTimings(metrics, 'plugin-test-all (2)', ['onStart', 'onResolve', 'onLoad', 'onEnd']);
          testTimings(metrics, 'plugin-test-no-end', ['onStart', 'onResolve', 'onLoad']);
          testTimings(metrics, 'plugin-test-no-end-onload', ['onStart', 'onResolve']);
          testTimings(metrics, 'plugin-test-onstart', ['onStart']);
          testTimings(metrics, 'plugin-test-no-hooks', []);
        } else {
          testTimings(metrics, 'plugin-test-all', [
            'setup',
            'onStart',
            'onResolve',
            'onLoad',
            'onEnd',
          ]);
          testTimings(metrics, 'plugin-test-all (2)', [
            'setup',
            'onStart',
            'onResolve',
            'onLoad',
            'onEnd',
          ]);
          testTimings(metrics, 'plugin-test-no-end', ['setup', 'onStart', 'onResolve', 'onLoad']);
          testTimings(metrics, 'plugin-test-no-end-onload', ['setup', 'onStart', 'onResolve']);
          testTimings(metrics, 'plugin-test-onstart', ['setup', 'onStart']);
          testTimings(metrics, 'plugin-test-no-hooks', ['setup']);
        }

        lastMetrics = metrics;
      })
    );

    await ctx.rebuild();

    await delay(10);

    // eslint-disable-next-line no-console
    console.log('\n***\n');

    await ctx.rebuild();

    await delay(10);

    await ctx.dispose();
  });

  await it('works in watch mode', async () => {
    let lastMetrics: TypeMetrics | undefined;

    const ctx = await context(
      getConfig((metrics) => {
        if (lastMetrics) {
          assert.notEqual(JSON.stringify(lastMetrics), JSON.stringify(metrics));

          testTimings(metrics, 'plugin-test-all', ['onStart', 'onResolve', 'onLoad', 'onEnd']);
          testTimings(metrics, 'plugin-test-all (2)', ['onStart', 'onResolve', 'onLoad', 'onEnd']);
          testTimings(metrics, 'plugin-test-no-end', ['onStart', 'onResolve', 'onLoad']);
          testTimings(metrics, 'plugin-test-no-end-onload', ['onStart', 'onResolve']);
          testTimings(metrics, 'plugin-test-onstart', ['onStart']);
          testTimings(metrics, 'plugin-test-no-hooks', []);
        } else {
          testTimings(metrics, 'plugin-test-all', [
            'setup',
            'onStart',
            'onResolve',
            'onLoad',
            'onEnd',
          ]);
          testTimings(metrics, 'plugin-test-all (2)', [
            'setup',
            'onStart',
            'onResolve',
            'onLoad',
            'onEnd',
          ]);
          testTimings(metrics, 'plugin-test-no-end', ['setup', 'onStart', 'onResolve', 'onLoad']);
          testTimings(metrics, 'plugin-test-no-end-onload', ['setup', 'onStart', 'onResolve']);
          testTimings(metrics, 'plugin-test-onstart', ['setup', 'onStart']);
          testTimings(metrics, 'plugin-test-no-hooks', ['setup']);
        }

        lastMetrics = metrics;
      })
    );

    await ctx.watch();

    await delay(500);

    // eslint-disable-next-line no-console
    console.log('\n***\n');

    fs.writeFileSync(
      path.resolve(pathRes, 'modifierAll.tsx'),
      `import './global.css';

  export const test = __dirname2;
  `,
      'utf-8'
    );

    await delay(500);

    await ctx.dispose();
  });
});

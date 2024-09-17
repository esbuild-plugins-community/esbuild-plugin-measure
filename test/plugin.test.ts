/* eslint-disable @typescript-eslint/no-magic-numbers, @typescript-eslint/naming-convention */

import * as fs from 'node:fs';
import * as path from 'node:path';
import * as assert from 'node:assert/strict';
import { afterEach, describe, it } from 'node:test';

import { build, BuildOptions, context } from 'esbuild';
import { yellow } from 'colorette';

import { pluginPerf, TypeHooks, TypeMetrics } from '../src/index.js';
import { TypeOptions } from '../src/types.js';

import {
  pluginNoEnd,
  pluginNoHooks,
  pluginOnStart,
  pluginAllHooks,
  pluginNoEndOnload,
} from './helpers/plugins.js';
import { delay, getTypedEntries, DELAYS } from './helpers/utils.js';

function showTotal(totalBuildTime: number) {
  // eslint-disable-next-line no-console
  console.log(`\nTEST: TOTAL ${yellow(`${totalBuildTime.toFixed(2)} ms`)}\n`);
}

function testTimings(timings: TypeMetrics, pName: string, h: Array<TypeHooks>) {
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

    const { hookDuration, iterations } = hooks[hookName];

    const minDuration = defaultDuration * iterations - 1;

    assert.equal(
      hookDuration > minDuration,
      true,
      `${hookName} duration should be more than ${minDuration} but it is ${hookDuration}`
    );
  });
}

function testAllPlugins(metrics: TypeMetrics, noSetup?: boolean) {
  const config = {
    'plugin-test-all': ['setup', 'onStart', 'onResolve', 'onLoad', 'onEnd'],
    'plugin-test-all (2)': ['setup', 'onStart', 'onResolve', 'onLoad', 'onEnd'],
    'plugin-test-no-end': ['setup', 'onStart', 'onResolve', 'onLoad'],
    'plugin-test-no-end-onload': ['setup', 'onStart', 'onResolve'],
    'plugin-test-onstart': ['setup', 'onStart'],
    'plugin-test-no-hooks': ['setup'],
  };

  getTypedEntries(config).forEach(([pluginName, hooksList]) => {
    testTimings(
      metrics,
      pluginName,
      // @ts-ignore
      hooksList.filter((hookName) => (noSetup ? hookName !== 'setup' : true))
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
      '.woff': 'file',
      '.woff2': 'file',
      '.ttf': 'file',
    },
    plugins: [
      pluginPerf({ onMetricsReady, logToConsole: true }),
      pluginAllHooks(),
      pluginAllHooks(),
      pluginNoEnd(),
      pluginNoEndOnload(),
      pluginOnStart(),
      pluginNoHooks(),
    ],
  });

  await it('works in build mode', async () => {
    const buildVersion = 1;
    const start = performance.now();
    let totalBuildTime = 0;
    let metrics!: TypeMetrics;

    // eslint-disable-next-line no-console
    console.log(`\nTEST: BUILD (${buildVersion})`);

    await build(getConfig((m) => (metrics = m)));

    totalBuildTime = performance.now() - start;

    await delay(10);

    showTotal(totalBuildTime);

    assert.equal(
      totalBuildTime > metrics.totalDuration,
      true,
      `TEST: BUILD (${buildVersion}) total duration ${metrics.totalDuration} should be less than ${totalBuildTime}`
    );

    testAllPlugins(metrics);
  });

  await it('works in rebuild mode', async () => {
    let buildVersion = 1;
    let lastMetrics: TypeMetrics | undefined;
    let start = performance.now();
    let totalBuildTime = 0;
    let metrics!: TypeMetrics;

    const ctx = await context(getConfig((m) => (metrics = m)));

    // eslint-disable-next-line no-console
    console.log(`\nTEST: REBUILD (${buildVersion})`);

    await ctx.rebuild();

    totalBuildTime = performance.now() - start;

    await delay(10);

    showTotal(totalBuildTime);

    assert.equal(
      totalBuildTime > metrics.totalDuration,
      true,
      `TEST: REBUILD (${buildVersion}) total duration ${metrics.totalDuration} should be less than ${totalBuildTime}`
    );

    testAllPlugins(metrics);

    // eslint-disable-next-line prefer-const
    lastMetrics = JSON.parse(JSON.stringify(metrics));

    start = performance.now();
    buildVersion += 1;

    // eslint-disable-next-line no-console
    console.log(`\nTEST: REBUILD (${buildVersion})`);

    await ctx.rebuild();

    totalBuildTime = performance.now() - start;

    await delay(10);

    showTotal(totalBuildTime);

    assert.notEqual(JSON.stringify(lastMetrics), JSON.stringify(metrics));

    testAllPlugins(metrics, true);

    await ctx.dispose();
  });

  await it('works in watch mode', async () => {
    let buildVersion = 1;
    let lastMetrics: TypeMetrics | undefined;
    let start = performance.now();
    let totalBuildTime = 0;
    let metrics!: TypeMetrics;

    const ctx = await context(
      getConfig((m) => {
        metrics = m;

        totalBuildTime = performance.now() - start;
      })
    );

    // eslint-disable-next-line no-console
    console.log(`\nTEST: WATCH (${buildVersion})`);

    await ctx.watch();

    await delay(500);

    showTotal(totalBuildTime);

    assert.equal(
      totalBuildTime > metrics.totalDuration,
      true,
      `TEST: REBUILD (${buildVersion}) total duration ${metrics.totalDuration} should be less than ${totalBuildTime}`
    );

    testAllPlugins(metrics);

    // eslint-disable-next-line prefer-const
    lastMetrics = JSON.parse(JSON.stringify(metrics));

    start = performance.now();
    buildVersion += 1;

    // eslint-disable-next-line no-console
    console.log(`\nTEST: WATCH (${buildVersion})`);

    fs.writeFileSync(
      path.resolve(pathRes, 'modifierAll.tsx'),
      `import './global.css';

  export const test = __dirname2;
  `,
      'utf-8'
    );

    await delay(500);

    showTotal(totalBuildTime);

    assert.notEqual(JSON.stringify(lastMetrics), JSON.stringify(metrics));

    testAllPlugins(metrics, true);

    await ctx.dispose();
  });
});

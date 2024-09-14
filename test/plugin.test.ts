/* eslint-disable @typescript-eslint/no-magic-numbers */

import * as fs from 'node:fs';
import * as path from 'node:path';
import * as assert from 'node:assert/strict';
import { afterEach, describe, it } from 'node:test';

import { build, BuildOptions, context, Plugin } from 'esbuild';

import { pluginPerf, TypeMetrics } from '../src/index.js';

const DELAYS: Record<'onStart' | 'onLoad' | 'onResolve' | 'onEnd' | 'setup', number> = {
  setup: 4,
  onStart: 5,
  onResolve: 6,
  onLoad: 7,
  onEnd: 8,
};

function delay(d: number) {
  return new Promise((resolve) => setTimeout(resolve, d));
}

type TypeEntries<T> = Array<
  {
    [K in keyof T]: [K, T[K]];
  }[keyof T]
>;

export const getTypedEntries = Object.entries as <T extends Record<string, any>>(
  obj: T
) => TypeEntries<T>;

const pluginTest = (): Plugin => {
  return {
    name: 'plugin-test',
    setup: async (b) => {
      await delay(DELAYS.setup);

      b.onStart(async () => {
        await delay(DELAYS.onStart);
      });

      b.onResolve({ filter: /./ }, async () => {
        await delay(DELAYS.onResolve);

        return undefined;
      });

      b.onLoad({ filter: /./ }, async () => {
        await delay(DELAYS.onLoad);

        return undefined;
      });

      b.onEnd(async () => {
        await delay(DELAYS.onEnd);
      });
    },
  };
};

function testTimings(timings: TypeMetrics, pName: string, secondTry?: boolean) {
  const allowedDiff = 5;

  assert.equal(timings[pName].events.setup.length === (secondTry ? 0 : 1), true, 'setup length');
  assert.equal(timings[pName].events.onStart.length === 1, true, 'onStart length');
  assert.equal(timings[pName].events.onResolve.length === 8, true, 'onResolve length');
  assert.equal(timings[pName].events.onLoad.length === 8, true, 'onLoad length');

  let totalDuration = 0;

  getTypedEntries(DELAYS).forEach(([hookName, defaultDuration]) => {
    timings[pName].events[hookName].forEach((duration) => {
      const minDuration = defaultDuration - 1;
      const maxDuration = minDuration + allowedDiff;

      totalDuration += duration;

      assert.equal(
        duration > minDuration && duration < maxDuration,
        true,
        `${hookName} duration should be between ${minDuration}<${maxDuration} but it is ${duration}`
      );
    });
  });

  assert.equal(
    timings[pName].duration === totalDuration,
    true,
    `total duration should be ${totalDuration} but it is ${timings[pName].duration}`
  );
}

void describe('Plugin test', async () => {
  const pathRes = path.resolve('test/res');
  const pathTemp = path.resolve('test/tmp');
  const pathTimings = path.resolve(pathTemp, 'timings.json');

  afterEach(() => {
    fs.readdirSync(pathTemp).forEach((file) => {
      fs.unlinkSync(path.resolve(pathTemp, file));
    });

    // eslint-disable-next-line no-console
    console.log('\n***\n');
  });

  const getConfig = (): BuildOptions => ({
    bundle: true,
    format: 'esm',
    logLevel: 'silent',
    outdir: pathTemp,
    target: 'chrome120',
    platform: 'browser',
    metafile: true,
    write: false,
    resolveExtensions: ['.ts'],
    loader: {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      '.woff': 'file',
      // eslint-disable-next-line @typescript-eslint/naming-convention
      '.woff2': 'file',
      // eslint-disable-next-line @typescript-eslint/naming-convention
      '.ttf': 'file',
    },
  });

  await it('works in build mode', async () => {
    const fileName = 'modifierAll';

    await build({
      ...getConfig(),
      entryPoints: [path.resolve(pathRes, `${fileName}.tsx`)],
      plugins: [
        pluginPerf({ logToFile: pathTimings, logToConsole: true }),
        pluginTest(),
        pluginTest(),
        pluginTest(),
      ],
      packages: 'external',
    });

    await delay(10);

    const timings: TypeMetrics = JSON.parse(fs.readFileSync(pathTimings, 'utf-8'));

    testTimings(timings, 'plugin-test');
    testTimings(timings, 'plugin-test (2)');
    testTimings(timings, 'plugin-test (3)');
  });

  await it('works in rebuild mode', async () => {
    const fileName = 'modifierAll';

    const ctx = await context({
      ...getConfig(),
      entryPoints: [path.resolve(pathRes, `${fileName}.tsx`)],
      plugins: [pluginPerf({ logToFile: pathTimings }), pluginTest(), pluginTest(), pluginTest()],
      packages: 'external',
    });

    await ctx.rebuild();

    await delay(10);

    // eslint-disable-next-line no-console
    console.log('\n***\n');

    const timings: TypeMetrics = JSON.parse(fs.readFileSync(pathTimings, 'utf-8'));

    testTimings(timings, 'plugin-test');
    testTimings(timings, 'plugin-test (2)');
    testTimings(timings, 'plugin-test (3)');

    await ctx.rebuild();

    await delay(10);

    const timings2: TypeMetrics = JSON.parse(fs.readFileSync(pathTimings, 'utf-8'));

    testTimings(timings2, 'plugin-test', true);
    testTimings(timings2, 'plugin-test (2)', true);
    testTimings(timings2, 'plugin-test (3)', true);

    assert.notEqual(JSON.stringify(timings), JSON.stringify(timings2));

    await ctx.dispose();
  });
});

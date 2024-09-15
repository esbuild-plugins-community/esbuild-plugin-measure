import { Plugin } from 'esbuild';

import { delay, DELAYS } from './utils.js';

let time: number;

export const pluginLogStart = (): Plugin => ({
  name: 'esbuild-plugin-log-start',
  setup(b) {
    b.onStart(() => {
      time = performance.now();
    });
  },
});

export const pluginLogEnd = (): Plugin => ({
  name: 'esbuild-plugin-log-end',
  setup(b) {
    b.onEnd(() => {
      const buildTime = (performance.now() - time).toFixed(2);

      // eslint-disable-next-line no-console
      console.log(`TOTAL: ${buildTime}ms`);

      time = 0;
    });
  },
});

export const pluginAllHooks = (): Plugin => {
  return {
    name: 'plugin-test-all',
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

export const pluginNoEnd = (): Plugin => {
  return {
    name: 'plugin-test-no-end',
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
    },
  };
};

export const pluginNoEndOnload = (): Plugin => {
  return {
    name: 'plugin-test-no-end-onload',
    setup: async (b) => {
      await delay(DELAYS.setup);

      b.onStart(async () => {
        await delay(DELAYS.onStart);
      });

      b.onResolve({ filter: /./ }, async () => {
        await delay(DELAYS.onResolve);

        return undefined;
      });
    },
  };
};

export const pluginOnStart = (): Plugin => {
  return {
    name: 'plugin-test-onstart',
    setup: async (b) => {
      await delay(DELAYS.setup);

      b.onStart(async () => {
        await delay(DELAYS.onStart);
      });
    },
  };
};

export const pluginNoHooks = (): Plugin => {
  return {
    name: 'plugin-test-no-hooks',
    setup: async () => {
      await delay(DELAYS.setup);
    },
  };
};
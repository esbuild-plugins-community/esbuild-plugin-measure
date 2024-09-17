import { Plugin } from 'esbuild';

import { delay, DELAYS } from './utils.js';

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

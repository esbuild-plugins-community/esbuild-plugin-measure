import { green, white, yellow, yellowBright } from 'colorette';

import { TypeMetrics } from './types.js';

export function logToConsole(metrics: TypeMetrics) {
  function pluralize(count: number, noun: string, suffix = 's') {
    return `${count} ${noun}${count !== 1 ? suffix : ''}`;
  }

  let summary = `\nPlugins (in parallel) took ${yellow(`${metrics.duration.toFixed(2)} ms`)}\n`;

  Object.entries(metrics.plugins).forEach(([pName, { duration, hooks }]) => {
    summary += green(`\n[${pName}] `);
    summary += `took ${yellowBright(`${duration.toFixed(2)} ms`)}`;

    Object.entries(hooks).forEach(([hookName, hookMetrics]) => {
      summary += `\n  ${white(`▶ ${hookName}`)}: ${pluralize(hookMetrics.iterations, 'execution')} `;
      summary += `took ${yellow(`${hookMetrics.duration.toFixed(2)} ms`)}`;
    });
  });
  // eslint-disable-next-line no-console
  console.log(summary);
}

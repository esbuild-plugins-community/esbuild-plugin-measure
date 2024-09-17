import { green, white, yellow } from 'colorette';

import { TypeMetrics } from './types.js';

export function logToConsole(metrics: TypeMetrics) {
  function pluralize(count: number, noun: string, suffix = 's') {
    return `${count} ${noun}${count !== 1 ? suffix : ''}`;
  }

  let summary = `\nPlugins from first hook execution to last took ${yellow(`${metrics.totalDuration.toFixed(2)} ms`)}\n`;

  Object.entries(metrics.plugins).forEach(([pName, { hooks }]) => {
    summary += green(`\n[${pName}] `);

    Object.entries(hooks).forEach(([hookName, hookMetrics]) => {
      summary += `\n  ${white(`▶ ${hookName}`)}: ${pluralize(hookMetrics.iterations, 'execution')} `;
      summary += `took ${yellow(`${hookMetrics.hookDuration.toFixed(2)} ms`)}`;
    });
  });
  // eslint-disable-next-line no-console
  console.log(summary);
}

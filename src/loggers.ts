import * as fs from 'node:fs';

import { green, white, yellow, yellowBright } from 'colorette';

import { TypeMetrics } from './types.js';

export function logToConsole(metrics: TypeMetrics) {
  function pluralize(count: number, noun: string, suffix = 's') {
    return `${count} ${noun}${count !== 1 ? suffix : ''}`;
  }

  Object.entries(metrics).forEach(([pName, { duration, events }]) => {
    let summary = green(`[${pName}] `);
    summary += `took ${yellowBright(`${duration.toFixed(2)} ms`)}`;

    Object.entries(events).forEach(([hookName, hookDurations]) => {
      const hookTotalDuration = hookDurations.reduce((acc, num) => acc + num, 0).toFixed(2);

      summary += `\n  ${white(`▶ ${hookName}`)}: ${pluralize(hookDurations.length, 'execution')} `;
      summary += `took ${yellow(`${hookTotalDuration} ms`)}`;
    });
    // eslint-disable-next-line no-console
    console.log(summary);
  });
}

export function logToFile(metrics: TypeMetrics, destination: string) {
  fs.writeFileSync(destination, JSON.stringify(metrics, null, 2), 'utf-8');
}

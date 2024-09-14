import { TypeOptions } from '../types.js';
import { pluginName } from '../constants.js';

export function validateOptions(options?: TypeOptions) {
  if (typeof options !== 'undefined') {
    if (Object.prototype.toString.call(options) !== '[object Object]') {
      throw new Error(`${pluginName}: Options must be a plain object`);
    }

    if (typeof options.logToConsole !== 'undefined') {
      if (typeof options.logToConsole !== 'boolean') {
        throw new Error(`${pluginName}: The "logToConsole" parameter must be a boolean`);
      }
    }

    if (typeof options.logToFile !== 'undefined') {
      if (typeof options.logToFile !== 'string') {
        throw new Error(`${pluginName}: The "logToFile" parameter must be a string`);
      }
      if (!options.logToFile) {
        throw new Error(`${pluginName}: The "logToFile" parameter must be a non-empty string`);
      }
    }
  }
}

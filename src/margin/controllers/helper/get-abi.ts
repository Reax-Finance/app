import { promises as fs } from 'fs';
import path from 'path';
import * as sentry from '@sentry/node';
import log from '../../config/logger';
// src\margin\controllers\helper\abis\abi.json
export async function getAbi (name: string): Promise<any> {
  try {
    const abis = JSON.parse((await fs.readFile(path.join(__dirname + '/../../../../../src/margin/controllers/helper/abis/abi.json'))).toString());
    if (!abis) {
      log.warn(`ABI_NOT_FOUND: ${name} - ${__filename}`);
      return null;
    }
    if (!abis[name]) {
      return null;
    }
    return abis[name];
  } catch (error) {
    sentry.captureException(error);
    log.error(`${error} - ${__filename}`);
    return null
  }
}


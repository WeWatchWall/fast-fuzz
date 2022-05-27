import fs from 'fs';
import path from 'path';

import logUpdate from 'log-update';
import safeStringify from 'fast-safe-stringify';

import {
  init as initWorker,
  count,
  fuzz as fuzzWorker,
  getInstances
} from './fuzz';
import { Results } from './result';

let isInit = false;
let instancesPath: string;

async function init(
  folder: string,
  src?: string,
  dist?: string
): Promise<void> {
  if (isInit) { return; }

  // Load the instances file.
  let instances: any;
  instancesPath = path.join(folder, '/fuzzInstances.json');
  if (fs.existsSync(instancesPath)) {
    instances = JSON.parse(fs.readFileSync(instancesPath, 'utf8'));
  }

  // Initialize the worker.
  await initWorker(folder, src, dist, instances);

  isInit = true;
}

export async function fuzz(
  folder: string,
  maxTime = 1e4,
  maxRuns = 1e5,
  methodPattern?: string,
  classPattern?: string,
  src?: string,
  dist?: string,
  verbose = false,
  force = false,
  resultsOut: Results[] = []
): Promise<Results[]> {
  await init(folder, src, dist);

  if (verbose) {
    const methodCount = count(methodPattern, classPattern);
    logUpdate(`
      Method count: ${methodCount},
      Estimated time (s): ${methodCount * maxTime / 1000}
    `);
    logUpdate.done();
  }

  await fuzzWorker(maxTime, maxRuns, methodPattern, classPattern, resultsOut);

  const instances = getInstances();
  saveInstances({ force, instances });
  return resultsOut;
}

/**
 * Saves instances to file.
 * @param { force, instances } 
 */
function saveInstances({ force, instances }: {
  force: boolean;
  instances: {
    [key: string]: {
      [key: string]: {
        instances: any[];
      };
    };
  };
}) {
  if (!force && fs.existsSync(instancesPath)) { return; }

  const output = safeStringify(instances);

  fs.writeFileSync(instancesPath, output);
}
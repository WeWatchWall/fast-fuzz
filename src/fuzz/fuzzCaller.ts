import fs from 'fs';
import path from 'path';
import os from 'os';

import logUpdate from 'log-update';
import safeStringify from 'fast-safe-stringify';

import {
  init as initSingle,
  count as countSingle,
  fuzz as fuzzSingle,
  getInstances as iSingle
} from './fuzz';
import { FuzzRunner } from './fuzzRunner';

import { Results } from './result';

let instancesPath: string;
let fuzzRunner: FuzzRunner;

/**
 * Initializes the code analysis.
 * @param folder 
 * @param [src]
 * @param [dist]
 */
async function init(
  folder: string,
  threads?: number,
  src?: string,
  dist?: string
): Promise<void> {
  // Load the instances file.
  let instances: any;
  instancesPath = path.join(folder, '/fuzzInstances.json');
  if (fs.existsSync(instancesPath)) {
    instances = JSON.parse(fs.readFileSync(instancesPath, 'utf8'));
  }

  // Initialize the worker.
  if (threads === 0) {
    await initSingle(folder, src, dist, instances);
  }
  else {
    fuzzRunner = new FuzzRunner();
    await fuzzRunner.init(folder, src, dist, instances, threads);
  }

}

/**
 * Fuzz the TS folder.
 * @param folder 
 * @param [maxTime] 
 * @param [methodPattern]
 * @param [classPattern]
 * @param [src]
 * @param [dist]
 * @param [verbose]
 * @param [force]
 * @param [resultsOut] 
 */
export async function fuzz(
  folder: string,
  threads?: number,
  maxTime = 1e4,
  methodPattern?: string,
  classPattern?: string,
  filePattern?: string,
  src?: string,
  dist?: string,
  verbose = false,
  force = false,
  resultsOut: Results[] = []
): Promise<Results[]> {
  await init(folder, threads, src, dist);

  console.clear();
  if (verbose) {
    let methodCount: number;
    if (threads === 0) {
      methodCount = await countSingle(
        methodPattern,
        classPattern,
        filePattern
      );
    } else {
      methodCount = await fuzzRunner.count(
        methodPattern,
        classPattern,
        filePattern
      );
    }

    // Log the method count and estimates.
    let threadsOut = threads === undefined ? os.cpus().length : threads;
    threadsOut = threadsOut === 0 ? 1 : threadsOut;
    logUpdate(`
      Method count: ${methodCount},
      Estimated time (s): ${(methodCount * maxTime / 1000) / threadsOut}
    `);
    logUpdate.done();
  }
  let instances: any;
  if (threads === 0) {
    await fuzzSingle(
      maxTime,
      methodPattern,
      classPattern,
      filePattern,
      resultsOut
    );

    instances = await iSingle();
  } else {
    await fuzzRunner.fuzz(
      maxTime,
      methodPattern,
      classPattern,
      filePattern,
      resultsOut
    );

    instances = await fuzzRunner.getInstances();
  }

  if (threads !== 0) {
    fuzzRunner.terminate();
  }

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
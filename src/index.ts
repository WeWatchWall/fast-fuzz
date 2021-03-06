#!/usr/bin/env node
const FlatPromise = require('flat-promise');
import commander from 'commander';
import logUpdate from 'log-update';
import safeStringify from 'fast-safe-stringify';

import { fuzz } from './fuzz/fuzzCaller';
import { Results } from './fuzz/result';

commander
  .addHelpCommand()
  .version(require('../../package').version)
  .option('-i, --input <path>', 'Path of the Typescript project.')
  .option('-n, --threads <count>', 'The number of parallel threads. Default = OS defined. 0 for in-process.')
  .option('-t, --maxTime <milliseconds>', 'The maximum time(ms) per function. Actual value is multiplied by 4. Default = 10s.')
  .option('-m, --methods <RegExp>', 'A Regex expression to filter the methods to test.')
  .option('-c, --classes <RegExp>', 'A Regex expression to filter the classes to test.')
  .option('-f, --files <RegExp>', 'A Regex expression to filter the files to test.')
  .option('-s, --source <path>', 'Path of the source folder relative to the project.')
  .option('-d, --dist <path>', 'Path of the binary folder relative to the project.')
  .option('-F, --force true', 'Force overwrite fuzz instances JSON file.')
  .option('-q, --quiet true', 'Only output the results JSON.')
  .parse(process.argv);

if (!commander.input) {
    console.error('Missing input folder.');
    process.exit(1);
}

async function Main() {
  if (commander.threads !== undefined) {
    commander.threads = Number.parseInt(commander.threads);
    if (Number.isNaN(commander.threads)) { delete commander.threads; }
  }
  if (commander.maxTime !== undefined) {
    commander.maxTime = Number.parseFloat(commander.maxTime);
    if (Number.isNaN(commander.maxTime)) { delete commander.maxTime; }
  }
  commander.quiet = commander.quiet !== undefined;
  commander.force = commander.force !== undefined;

  if (!('toJSON' in Error.prototype)) {
    Object.defineProperty(Error.prototype, 'toJSON', {
      value: function () {
        const alt = {};
        alt['name'] = this.name;
        
        Object.getOwnPropertyNames(this).forEach((key) => {
          alt[key] = this[key];
        }, this);

        return alt;
      },
      configurable: true,
      writable: true
    });
  }

  // Just wait for results for non-interactive session.
  if (commander.quiet) {
    console.log(safeStringify(await fuzz(
      commander.input,
      commander.threads,
      commander.maxTime,
      commander.methods,
      commander.classes,
      commander.files,
      commander.source,
      commander.dist,
      !commander.quiet,
      commander.force
    )));
    return;
  }

  // Show intermediate results.
  const start: number = Date.now();
  const results: Results[] = [];
  let isResolved = false;
  fuzz(
    commander.input,
    commander.threads,
    commander.maxTime,
    commander.methods,
    commander.classes,
    commander.files,
    commander.source,
    commander.dist,
    !commander.quiet,
    commander.force,
    results
  ).then(() => {
    isResolved = true;
  });

  while (!isResolved) {
    await wait(5000);

    logUpdate(safeStringify(results));
  }

  logUpdate(safeStringify(results));
  logUpdate.done();
  logUpdate(`
    Time elapsed (s): ${(Date.now() - start) / 1e3}
  `);
  logUpdate.done();
}
Main();

async function wait(ms) {
  const flatPromise = new FlatPromise();

  setTimeout(() => flatPromise.resolve(), ms);
  return flatPromise.promise;
}
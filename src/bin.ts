#!/usr/bin/env node

import commander from 'commander';
import safeStringify from 'fast-safe-stringify';

import { fastFuzz } from './fuzz/fuzz';

commander
  .addHelpCommand()
  .version(require('../package').version)
  .option('-i, --input <path>', 'Path of the Typescript project.')
  .option('-t, --maxTime <milliseconds>', 'The maximum time(ms) per function. Actual value is multiplied by 4. Default = 10s.')
  .option('-n, --maxRuns <milliseconds>', 'The maximum count of runs per function. Default = 100e3.')
  .option('-m, --methods <RegExp>', 'A Regex expression to filter the methods to test.')
  .option('-c, --classes <RegExp>', 'A Regex expression to filter the classes to test.')
  .option('-s, --source <path>', 'Path of the source folder relative to the project.')
  .option('-d, --dist <path>', 'Path of the binary folder relative to the project.')
  .parse(process.argv);

if (!commander.input) {
    console.error('Missing input folder.');
    process.exit(1);
}

async function Main() {
  if (commander.maxTime !== undefined) {
    commander.maxTime = Number.parseFloat(commander.maxTime);
    if (Number.isNaN(commander.maxTime)) { delete commander.maxTime; }
  }
  if (commander.maxRuns !== undefined) {
    commander.maxRuns = Number.parseFloat(commander.maxRuns);
    if (Number.isNaN(commander.maxRuns)) { delete commander.maxRuns; }
  }

  console.log(safeStringify(await fastFuzz(
    commander.input,
    commander.maxTime,
    commander.maxRuns,
    commander.methods,
    commander.classes,
    commander.source,
    commander.dist,
    true
  )));
}
Main();
#!/usr/bin/env node

import commander from 'commander';
import safeStringify from 'fast-safe-stringify';

import { fastFuzz } from './fuzz/fuzz';

commander
  .version(require('../package').version)
  .option('-i, --input <path>', 'Path of the Typescript project.')
  .option('-s, --source <path>', 'Path of the source folder relative to the project.')
  .option('-d, --dist <path>', 'Path of the binary folder relative to the project.')
  .option('-t, --timeMax <milliseconds>', 'The maximum time(ms) per function. Actual value is multiplied by 4. Default = 10s.')
  .option('-c, --countMax <milliseconds>', 'The maximum count of runs per function. Default = 100e3.')
  .parse(process.argv);

if (!commander.input) {
    console.error('Missing input folder.');
    process.exit(1);
}

async function Main() {
  debugger;

  if (commander.timeMax !== undefined) {
    commander.timeMax = Number.parseFloat(commander.timeMax);
    if (Number.isNaN(commander.timeMax)) { delete commander.timeMax; }
  }
  if (commander.countMax !== undefined) {
    commander.countMax = Number.parseFloat(commander.countMax);
    if (Number.isNaN(commander.countMax)) { delete commander.countMax; }
  }

  console.log(safeStringify(await fastFuzz(
    commander.input,
    commander.timeMax,
    commander.countMax,
    commander.source,
    commander.dist,
  )));
}
Main();
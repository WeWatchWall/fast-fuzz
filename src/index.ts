import 'reflect-metadata';

import { readFile } from 'fs/promises';

import glob from 'glob';
import FlatPromise from 'flat-promise';

import { mock } from 'intermock/build/src/lang/ts/intermock';

// const worker = require('./worker.js');

import { plainToInstance } from 'class-transformer';
import { Foo } from "./foo";

async function Main() {
  const tsFiles = await getFiles(process.argv[2], false);

  const jsFiles = await getFiles(process.argv[3], true);

  console.log(`TS Files: ${JSON.stringify(tsFiles)}, JS Files: ${JSON.stringify(jsFiles)}`);
  

  // const job1 = worker.init();
  // const result1 = job1.run();

  // console.log((await result1));
  // job1.worker.terminate();

  const example1 = mock({
    files: [
      ['./src/IFoo.ts', await readFile('./src/IFoo.ts', 'utf8')]
    ],
    isOptionalAlwaysEnabled: true,
    output: 'object'
  });

  const example2 = plainToInstance(
    Foo,
    example1['Foo'],
    {
      enableImplicitConversion: true
    }
  );

  debugger;
  console.log(example2);
}
Main();

async function getFiles(filesArgument: string, isJs: boolean) {
  const flatPromise = new FlatPromise();
  glob(<string>`${filesArgument}/**/*.${isJs ? 'js' : 'ts'}`, {}, (err: Error | null, matches: string[]): void => {
    if (err !== null) {
      flatPromise.reject(err);
      return;
    }

    flatPromise.resolve(matches);
  });

  return flatPromise.promise;
}

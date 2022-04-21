import 'reflect-metadata';

import glob from 'glob';
import FlatPromise from 'flat-promise';

// const worker = require('./worker.js');

import { plainToClass } from 'class-transformer';
import { Foo } from "./foo";
import { Direction } from './direction';

async function Main() {
  const tsFiles = await getFiles(process.argv[2], false);

  const jsFiles = await getFiles(process.argv[3], true);

  console.log(`TS Files: ${JSON.stringify(tsFiles)}, JS Files: ${JSON.stringify(jsFiles)}`);
  

  // const job1 = worker.init();
  // const result1 = job1.run();

  // console.log((await result1));
  // job1.worker.terminate();

  const example: Foo = plainToClass(Foo, {
    name: "what",
    age: 1,
    student: false,
    direction: Direction.Right
  });

  debugger;
  console.log(example);
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

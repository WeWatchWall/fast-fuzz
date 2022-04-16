import glob from 'glob';
import FlatPromise from 'flat-promise';

import { tplant } from 'tplant';

const worker = require('./src/worker');

async function Main() {
  let flatPromise = new FlatPromise();
  const tsFiles = await getFiles(process.argv[2], false, flatPromise);

  flatPromise = new FlatPromise();
  const jsFiles = await getFiles(process.argv[3], true, flatPromise);

  console.log(`TS Files: ${JSON.stringify(tsFiles)}, JS Files: ${JSON.stringify(jsFiles)}`);

  let result: any[];
  result = tplant.generateDocumentation(tsFiles);
  console.log(JSON.stringify(result));
  
  
  const job1 = worker.init();
  const result1 = job1.run();

  console.log(!!(await result1));
  job1.worker.terminate();
}
Main();

async function getFiles(filesArgument: string, isJs: boolean, flatPromise: any) {
  glob(<string>`${filesArgument}/**/*.${isJs ? 'js' : 'ts'}`, {}, (err: Error | null, matches: string[]): void => {
    if (err !== null) {
      flatPromise.reject(err);
      return;
    }

    flatPromise.resolve(matches);
  });
  var tsFiles = await flatPromise.promise;
  return tsFiles;
}

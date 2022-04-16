import glob from 'glob';
import FlatPromise from 'flat-promise';

import { tplant } from 'tplant';

const worker = require('./src/worker');

async function Main() {
  let flatPromise = new FlatPromise();

  glob(<string>process.argv[2], {}, (err: Error | null, matches: string[]): void => { 
    if (err !== null) {
      flatPromise.reject(err);
      return;
    }

    flatPromise.resolve(matches);
  });

  let result: any[];
  var files = await flatPromise.promise;
  debugger;
  result = tplant.generateDocumentation(files);

  console.log(JSON.stringify(files));
  console.log(JSON.stringify(result));
  
  
  const job1 = worker.init();
  const result1 = job1.run();

  console.log(!!(await result1));
  job1.worker.terminate();
}
Main();
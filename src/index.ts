import glob from 'glob';
import FlatPromise from 'flat-promise';

const worker = require('./worker.js');

async function Main() {
  const tsFiles = await getFiles(process.argv[2], false);

  const jsFiles = await getFiles(process.argv[3], true);

  console.log(`TS Files: ${JSON.stringify(tsFiles)}, JS Files: ${JSON.stringify(jsFiles)}`);
  
  
  const job1 = worker.init();
  const result1 = job1.run();

  console.log((await result1));
  job1.worker.terminate();
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

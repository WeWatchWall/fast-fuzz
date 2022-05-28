import os from 'os'

import AwaitLock from 'await-lock';
import FlatPromise from 'flat-promise';

import { Globals } from '../utils/globals';
import { FuzzWorker } from './fuzzWorker';
import { Results } from './result';

export class FuzzRunner {
  /* #region  Local variables. */
  private lock = new AwaitLock();
  private methodIndexPre: number;
  private methodIndexPost: number;

  private pCount: number;
  private workers: FuzzWorker[] = [];
  /* #endregion */

  /**
   * Inits the local code analysis and type stuffing.
   * @param folder 
   * @param [src] 
   * @param [dist] 
   * @param [instances] 
   */
  async init(
    folder: string,
    src?: string,
    dist?: string,
    instances?: any,
    pCount?: number
  ): Promise<void> {
    if (pCount === undefined) {
      this.pCount = os.cpus().length;
    } else {
      this.pCount = pCount;
    }

    for (let index = 0; index < this.pCount; index++) {
      const worker = new FuzzWorker();
      this.workers.push(worker)
      await worker.init(
        folder,
        src,
        dist,
        instances
      );
    }
  }

  /**
   * Counts the number of methods.
   * @param [methodPattern]
   * @param [classPattern]
   * @returns count of methods.
   */
  async count(
    methodPattern?: string,
    classPattern?: string,
    filePattern?: string
  ): Promise<number> {
    return await this.workers[0].count(
      methodPattern,
      classPattern,
      filePattern
    );
  }

  /**
   * Fuzz the TS folder.
   * @param [maxTime] 
   * @param [maxRuns] 
   * @param [methodPattern]
   * @param [classPattern]
   * @param [resultsOut] 
   */
  async fuzz(
    maxTime = 1e4,
    maxRuns = 1e5,
    methodPattern?: string,
    classPattern?: string,
    filePattern?: string,
    resultsOut: Results[] = []
  ): Promise<Results[]> {
    const count = await this.count(methodPattern, classPattern, filePattern);
    const pCount = Math.min(count, this.pCount);
    const finalPromise = new FlatPromise();

    this.methodIndexPre = - 1;
    this.methodIndexPost = - 1;
    for (let index = 0; index < pCount; index++) {
      this.runWorker(
        this.workers[index],
        finalPromise,
        maxTime,
        maxRuns,
        methodPattern,
        classPattern,
        filePattern,
        resultsOut,
        count
      );
    }
    await finalPromise.promise;

    return resultsOut;
  }

  /**
   * Gets instances.
   * @returns instances 
   */
  async getInstances(): Promise<any> {
    Globals.instances = {};

    for (const worker of this.workers) {
      const instances = await worker.getInstances();

      Object.entries(instances).forEach(([file, typeInstances]) => {
        if (Globals.instances[file] === undefined) {
          Globals.instances[file] = {};
        }

        Object.entries(typeInstances)
          .forEach(([type, instances]: [string, { instances: any[]; }]) => {
            if (Globals.instances[file][type] === undefined) {
              Globals.instances[file][type] = {
                instances: []
              };
            }

            Globals.instances[file][type].instances.push(...instances.instances);
          });
      });
    }

    return Globals.instances;
  }

  /**
   * Terminates fuzz workers.
   */
  terminate(): void {
    let worker: FuzzWorker;
    while ((worker = this.workers.pop()) !== undefined) {
      worker.terminate();
    }
  }

  /**
   * Runs worker until there are no more methods to fuzz.
   * @param worker 
   * @param count 
   * @param finalPromise 
   * @param maxTime 
   * @param maxRuns 
   * @param methodPattern 
   * @param classPattern 
   * @param filePattern 
   * @param resultsOut 
   */
  private async runWorker(
    worker: FuzzWorker,
    finalPromise: any,
    maxTime: number,
    maxRuns: number,
    methodPattern: string,
    classPattern: string,
    filePattern: string,
    resultsOut: Results[],
    count: number
  ): Promise<void> {
    // Consume methods until they run out.
    do {
      let resultsP: Promise<Results[]>

      await this.lock.acquireAsync();
      try {
        // Increment the method
        this.methodIndexPre++;

        // Run one method.
        resultsP = worker.fuzz(
          maxTime,
          maxRuns,
          methodPattern,
          classPattern,
          filePattern,
          resultsOut,
          this.methodIndexPre,
          1
        );
      } finally {
        this.lock.release();
      }

      await resultsP;
  
      // Accounting for finished methods.
      await this.lock.acquireAsync();
      try {
        this.methodIndexPost++;
      } finally {
        this.lock.release();
      }
    } while(this.methodIndexPre < count - 1);

    // Finalize the results.
    if (this.methodIndexPost === count - 1) {
      finalPromise.resolve();
    }
  }
}
import { Results } from './result';
import { Call, workerInit } from './worker';

export class FuzzWorker {
  private worker = workerInit();

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
    instances?: any
  ): Promise<void> {
    await this.worker.run({
      name: Call.init,
      args: [folder, src, dist, instances]
    });
  }

  /**
   * Counts the number of methods.
   * @param [methodPattern]
   * @param [classPattern]
   * @returns count of methods.
   */
  async count(
    methodPattern?: string,
    classPattern?: string
  ): Promise<number> {
    return await this.worker.run({
      name: Call.count,
      args: [methodPattern, classPattern]
    });
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
    resultsOut: Results[] = []
  ): Promise<Results[]> {
    const result = JSON.parse(await this.worker.run({
      name: Call.fuzz,
      args: [
        maxTime,
        maxRuns,
        methodPattern,
        classPattern
      ]
    }));

    resultsOut.push(...result);
    return resultsOut;
  }

  /**
   * Gets instances.
   * @returns instances 
   */
  async getInstances(): Promise<any> {
    return JSON.parse(await this.worker.run({
      name: Call.getInstances,
      args: []
    }));
  }

  /**
   * Terminates fuzz worker.
   */
  terminate(): void {
    this.worker.worker.terminate();
  }
}
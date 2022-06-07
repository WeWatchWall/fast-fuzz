// import { fastFuzz } from './fuzzNew';
import Multee from 'multee';
import safeStringify from 'fast-safe-stringify';

import {
  init,
  count,
  fuzz,
  getInstances
} from './fuzz';

const multee = Multee('worker'); // 'worker' for worker_threads | 'child' for child_process

const job = multee.createHandler(
  'job',
  async (callArgs: {
    name: Call,
    args: any[]
  }): Promise<any> => {
    switch (callArgs.name) {
      case Call.init:
        // Add JSON writer to all the errors.
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

        return await init(
          callArgs.args[0],
          callArgs.args[1],
          callArgs.args[2],
          callArgs.args[3]
        );
      case Call.count:
        return await count(
          callArgs.args[0],
          callArgs.args[1],
          callArgs.args[2]
        );
      case Call.fuzz:
        return safeStringify(await fuzz(
          callArgs.args[0],
          callArgs.args[1],
          callArgs.args[2],
          callArgs.args[3],
          callArgs.args[4],
          callArgs.args[5],
          callArgs.args[6]
        ));
      case Call.getInstances:
        return safeStringify(await getInstances());
    }

  }
);

export enum Call {
  init,
  count,
  fuzz,
  getInstances
}

export const workerInit = () => {
  const worker = multee.start(__filename);
  return {
    run: job(worker),
    worker: worker
  };
}
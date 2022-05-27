// import { fastFuzz } from './fuzzNew';
import Multee from 'multee';
const multee = Multee('worker'); // 'worker' for worker_threads | 'child' for child_process

const job = multee.createHandler(
  'job',
  async (callArgs: {
    name: Call,
    args: any[]
  }) => {
    console.log(JSON.stringify(callArgs));

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
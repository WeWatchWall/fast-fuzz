const Multee = require('multee');
const multee = Multee('worker'); // 'worker' for worker_threads | 'child' for child_process

const fuzzSync = require("./fuzzSync");

const istanbul_lib_instrument = require("istanbul-lib-instrument");
const istanbul_lib_hook = require("istanbul-lib-hook");

const instrumenter = (0, istanbul_lib_instrument.createInstrumenter)({ compact: true, reportLogic: true });
(0, istanbul_lib_hook.hookRequire)((filePath) => true, (code, { filename }) => {
    if (filename.includes('node_modules')) {
        return code;
    }
    const newCode = instrumenter.instrumentSync(code, filename);
    return newCode;
});


const foo = require("./foo");
const direction = require("./direction");

const job = multee.createHandler('job', () => {
  const result = fuzzSync.fastFuzz(
    (name, age, mark) => { 
      let fooLocal = new foo.Foo('Bob', 22);

      return fooLocal.isSame(name, age, direction.Direction.Down)
    },
    './dist/foo.js',
    [
      '{"type":"string"}',
      '{"type":"int"}',
      '{"type":"int"}'
    ],
    ['Bob', 'Alice', 22, 10, 7],
    2e3,
    5e6,
    true,
    false
  );

  return result
});

module.exports = {
  init: () => {
    const worker = multee.start(__filename);
    return {
      run: job(worker),
      worker: worker
    };
  }
}

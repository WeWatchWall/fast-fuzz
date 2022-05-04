import { createInstrumenter } from 'istanbul-lib-instrument';
import { hookRequire } from 'istanbul-lib-hook';

import { fastFuzz } from './src/fuzzSync';
import { fastFuzzAsync } from './src/fuzzAsync';

const instrumenter = createInstrumenter({ compact: true, reportLogic: true });

hookRequire((filePath) => true, (code, { filename }) => {
    if (filename.includes('node_modules')) {
      return code;
    }

    const newCode = instrumenter.instrumentSync(code, filename);
    return newCode;
});

export { 
  fastFuzz,
  fastFuzzAsync
}; 

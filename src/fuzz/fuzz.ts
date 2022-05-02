import { createInstrumenter } from 'istanbul-lib-instrument';
import { hookRequire } from 'istanbul-lib-hook';

// import { fastFuzz } from './fuzzSync';

const instrumenter = createInstrumenter({ compact: true, reportLogic: true });

hookRequire((_filePath) => true, (code, { filename }) => {
  if (filename.includes('node_modules')) {
    return code;
  }

  const newCode = instrumenter.instrumentSync(code, filename);
  return newCode;
});

export function fuzz() {

}
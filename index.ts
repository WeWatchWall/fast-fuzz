import fc from "fast-check";
import path from "path";
import copy from "fast-copy";
import { diff } from 'deep-object-diff';
import { createInstrumenter } from 'istanbul-lib-instrument';
import { hookRequire } from 'istanbul-lib-hook';

const instrumenter = createInstrumenter({ compact: true });

hookRequire((filePath) => true, (code, {filename}) => {
    const newCode = instrumenter.instrumentSync(code, filename);
    return newCode;
});

// Creates random generators from the API and literals.
const makeArbitrary = function (schema, mode = -1, literals = null) {
  if (schema === null) {
    return fc.falsy();
  } else if (typeof schema === 'string' && Object.prototype.toString.call(schema) === '[object String]') {
    let obj;
    try { obj = JSON.parse(schema); } catch {
      // Just generate constant.
    }
    if (!obj || !obj.type) {
      return fc.constant(schema);
    } else if (obj.type === 'bool' || obj.type === 'boolean') {
      return fc.boolean();
    } else if (obj.type === 'int' || obj.type === 'integer') {
      let min;
      let max;
      let localLits;

      if (mode === 0) {
        localLits = fc.oneof(fc.constantFrom(...[...literals.int.values, 0]), fc.falsy());
      } else if (mode > 0) {
        min = (isNaN(obj.min) ? 0  - 10 ** mode : obj.min);
        max = (isNaN(obj.max) ? 0 + 10 ** mode : obj.max);
      }

      return localLits || fc.oneof(fc.constantFrom(...[...literals.int.values, 0]), fc.integer({
        min: obj.min || min,
        max: obj.max || max
      }));
    } else if (obj.type === 'float' || obj.type === 'number') {
      let min;
      let max;
      let localLits;

      if (mode === 0) {
        localLits = fc.oneof(fc.constantFrom(...[...literals.float.values, 0]), fc.falsy());
      } else if (mode > 0) {
        min = (isNaN(obj.min) ? 0 - 10 ** mode : obj.min);
        max = (isNaN(obj.max) ? 0  + 10 ** mode : obj.max);
      }

      return localLits || fc.oneof(fc.constantFrom(...[...literals.float.values, 0]), fc.float({
        min: obj.min || min,
        max: obj.max || max
      }));
    } else if (obj.type === 'date') {
      let min;
      let max;
      let localLits;
      const dateOffset = 24 * 3600 * 1e3;

      if (mode === 0) {
        localLits = fc.oneof(fc.constantFrom(...[...literals.date.values, new Date()]), fc.falsy());
      } else if (mode > 0) {
        min = new Date((isNaN(obj.min) ? new Date().getTime() - dateOffset * 2 ** mode : obj.min));
        max = new Date((isNaN(obj.max) ? new Date().getTime() +  dateOffset * 2 ** mode : obj.max));
      }
      
      return localLits || fc.oneof(fc.constantFrom(...[...literals.date.values, new Date()]), fc.date({
        min: obj.min || min,
        max: obj.max || max
      }));
    } else if (obj.type === 'string') {
      let min;
      let localLits;

      if (mode === 0) {
        localLits = fc.oneof(fc.constantFrom(...[...literals.string.values, '']), fc.falsy());
      } else if (mode > 0) {
        min = isNaN(obj.min) ? 0 + mode : obj.min;
      }
      
      return localLits || fc.oneof(fc.constantFrom(...[...literals.string.values, '']), fc.string({
        minLength: obj.min || min,
        maxLength: obj.max
      }));
    } else {
      return fc.constant(schema);
    }
  } else if (Array.isArray(schema)) {
    // Recurse on elements and return wrapped with tuple.
    const result = [];
    for (const element of schema) {
      result.push(makeArbitrary(element, mode, literals));
    }
    return fc.tuple(...result);
  } else if (typeof schema === 'object') {
    const result = {};
    for (const key in schema) {
      result[key] = makeArbitrary(schema[key], mode, literals);
    }
    return fc.record(result);
  // } else if (typeof schema === 'function') {
  //   return undefined;
  } else {
    return fc.constant(schema);
  }
};

// Organizes the literals by type and calculates their boundaries.
const getLiterals = function (literals) {
  // Init.
  const result = {
    date: { values: [], max: undefined, min: undefined },
    int: { values: [], max: undefined, min: undefined },
    float: { values: [], max: undefined, min: undefined },
    string: { values: [], max: undefined, min: undefined }
  };

  // Pigeonhole the literals.
  for (const literal of literals) {
    if (Object.prototype.toString.call(literal) === '[object Date]') {
      result.date.values.push(literal.getTime());
    } else if (Number.isSafeInteger(literal)) {
      result.int.values.push(literal);
    } else if (!isNaN(literal)) {
      result.float.values.push(literal);
    } else if (typeof literal === 'string' && Object.prototype.toString.call(literal) === '[object String]') {
      result.string.values.push(literal);
    } else {
      continue;
    }
  }

  // Compute limits.
  const dateOffset = 7 * 24 * 3600 * 1e3;
  for (const key in result) {
    if (key === 'date' && result.date.values.length) {
      result.date.min = Math.min(...result.date.values) - dateOffset;
      result.date.max = Math.max(...result.date.values) + dateOffset;
    } else if ((key === 'int' || key === 'float') && result[key].values.length) {
      result[key].min = Math.min(0, ...result[key].values);
      result[key].max = Math.max(0, ...result[key].values);
    } else if (key === 'string' && result.string.values.length) {
      result.string.min = Math.min(...result.string.values.map(str => str.length));
    }
  }

  return result;
}

// Checks if the all the known branches are covered.
const isCovered = function (fileName) {
  const fileCov = global.__coverage__[fileName];
  for (const key in fileCov.b) {
    const branchCov = fileCov.b[key];
    for (const entry of branchCov) {
      if (!entry) { return false; }
    }
  }
  for (const key in fileCov.bT) {
    const branchCov = fileCov.bT[key];
    for (const entry of branchCov) {
      if (!entry) { return false; }
    }
  }
  return true;
};

// Sets all the branch stats to 0.
const resetCoverage = function (fileName) {
  const fileCov = global.__coverage__[fileName];
  for (const key in fileCov.b) {
    const branchCov = fileCov.b[key];
    for (const index in branchCov) {
      branchCov[index] = 0;
    }
  }
  for (const key in fileCov.bT) {
    const branchCov = fileCov.bT[key];
    for (const index in branchCov) {
      branchCov[index] = 0;
    }
  }
  return true;
};

// Fastest known hash method for a string.
const simpleHash = str => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash &= hash; // Convert to 32bit integer
  }
  return new Uint32Array([hash])[0].toString(36);
};

// Main fuzzing function that runs the tests and reports the results. 
module.exports.fastFuzz = function (filePath, methodName = null, parameterSchema = null, literals = [], maxTime = 1e4, maxRuns = 1e5, reset = true, verbose = false) {
  // Resolve and import the system under test(SUT).
  filePath = path.resolve(filePath);
  delete require.cache[require.resolve(filePath)]
  let testFunc = require(filePath);
  if (methodName) {
    testFunc = testFunc[methodName];
  }

  const litResult = getLiterals(literals);

  // Track progress.
  const covResults = new Set();
  const results = [];

  // Expand and repeat the fuzz area.
  const maxMode = 4;
  let numResults = 1;
  for (let mode = 0; mode <= maxMode; mode++) {
    // Vary the number of runs based on target area.
    let maxRunsLocal;
    if (mode == 0) {
      maxRunsLocal = 1000;
    } else if (mode == maxMode) {
      maxRunsLocal = maxRuns;
    } else {
      maxRunsLocal = 300 * 10 ** mode; // maxRuns / (10 ** (maxMode - mode));
    }
    
    // Use the full range after growth.
    const arbitrary = makeArbitrary(parameterSchema, mode === maxMode ? -1 : mode, litResult);
    
    // Store coverage pointer for the sake of performance.
    const fileCoverage = {
      b: global.__coverage__[filePath].b,
      bT: global.__coverage__[filePath].bT
    };

    // Run the tests.
    let numRuns = 0;
    const start = new Date().getTime();
    let isExpired = false;
    try {
      fc.assert(fc.property(arbitrary.filter(args => {
          if (numRuns % 1e3 == 0) { isExpired = new Date().getTime() - start > maxTime; }
          if (isExpired || numRuns++ > maxRunsLocal) { throw new Error("Test run aborted."); }
          
          const covBefore = copy(fileCoverage);
          
          try { testFunc(args); } catch { 
            // Will get caught when running the test and saved in the result.
          }
          
          // Hash difference between coverage.
          let covDiff = JSON.stringify({
            // f: diff(fileCoverageBefore?.f, fileCoverage.f),
            // s: diff(fileCoverageBefore?.s, fileCoverage.s),
            b: diff(covBefore === null || covBefore === void 0 ? void 0 : covBefore.b, fileCoverage.b),
            bT: diff(covBefore === null || covBefore === void 0 ? void 0 : covBefore.bT, fileCoverage.bT)
          });
          covDiff = covDiff.replace(/:\d+/g, ":1");
          const covHash = simpleHash(covDiff);
          
          // Track coverage history.
          if (covResults.has(covHash)) { return false; }
          covResults.add(covHash);
          const tempRuns = numRuns;
          numRuns = 0;

          if (!verbose) { return true; }
          
          // Print stats when verbose.
          console.log(`${numResults} ${JSON.stringify({
            mode: mode,
            numRuns: tempRuns,
            speed: (new Date().getTime() - start) / tempRuns,
            isLinesCovered: isCovered(filePath)
          })} ${covDiff}`);
          return true;
        }),
        arg => {
          // Run and store the results.
          let result;
          try {
            result = testFunc(arg);
          } catch (error) {
            result = error;
          }
          const argResult = {
            arg: arg,
            result: result
          };
          results.push(argResult);
          if (verbose) { console.log(`${numResults++} ${JSON.stringify(argResult)}`) }

          // Keep running.
          return true;
        }
      ),
      {
        verbose: false, // true
        numRuns: maxRuns, // 10000000
        ignoreEqualValues: true // true
      });
    } catch {
      // Ignore self-generated exceptions for exiting the test loop.
    }
  }

  const coverage = copy(global.__coverage__);

  if (reset) {
    resetCoverage(filePath);
  }

  // Report full coverage and generated tests.
  return {
    coverage: coverage,
    tests: results
  };
}

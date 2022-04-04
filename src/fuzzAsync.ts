import fc from "fast-check";
import path from "path";
import copy from "fast-copy";
import { diff } from 'deep-object-diff';

import {
  getLiterals,
  makeArbitrary,
  simpleHash,
  isCovered,
  resetCoverage
} from './util';

// Main fuzzing function that runs the tests and reports the results. 
export async function fastFuzzAsync (testFunc, filePath, parameterSchema = null, literals = [], maxTime = 1e4, maxRuns = 1e5, reset = true, verbose = false) {
  // Resolve the system under test(SUT).
  filePath = path.resolve(filePath);
  if (!global.__coverage__[filePath]) { throw new Error(`File not found: ${filePath}`); }

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

    // Test loop stats.
    let numRuns = 0;
    let start = Date.now();
    let isExpired = false;
    let isShrinking = false;

    try {
      await fc.assert(fc.asyncProperty(arbitrary,
        async arg => {
          // Check the running stats for termination.
          if (numRuns % 1e3 == 0) {
            isExpired = Date.now() - start > maxTime;
          }
          if (!isShrinking && (numRuns++ > maxRunsLocal || isExpired)) {
            isShrinking = true;
            return false;
          }

          const covBefore = copy(fileCoverage);

          // Run and store the results.
          let result;
          try {
            result = await testFunc(arg);
          } catch (error) {
            result = error;
          }

          // Hash difference between coverage.
          let covDiff = JSON.stringify({
            // f: diff(fileCoverageBefore?.f, fileCoverage.f),
            // s: diff(fileCoverageBefore?.s, fileCoverage.s),
            b: diff(covBefore === null || covBefore === void 0 ? void 0 : covBefore.b, fileCoverage.b),
            bT: diff(covBefore === null || covBefore === void 0 ? void 0 : covBefore.bT, fileCoverage.bT)
          });
          covDiff = covDiff.replace(/:\d+/g, ":1");  // All counter values get replaced by 1.
          const covHash = simpleHash(covDiff);
          
          // Track coverage history.
          fc.pre(!covResults.has(covHash));
          covResults.add(covHash);

          // Reset stats for next test case.
          const tempRuns = numRuns;
          numRuns = 0;
          const tempStart = start;
          start = Date.now();

          // Report test case.
          const argResult = {
            arg: arg,
            result: result
          };
          results.push(argResult);

          // Report verbose info to stdout.
          if (!verbose) { return !isShrinking; }
          console.log(`${JSON.stringify({
            id: numResults++,
            mode: mode,
            numRuns: tempRuns,
            speed: (tempRuns / (Date.now() - tempStart)).toPrecision(4),
            isLinesCovered: isCovered(filePath),
            argResult: argResult,
            covDiff: JSON.parse(covDiff)
          })}`);

          // Keep running.
          return !isShrinking;
        }
      ),
      {
        verbose: false,
        numRuns: maxRuns,
        ignoreEqualValues: false
      });
    } catch (error) {
      // Ignore exceptions from the test loop.
      isShrinking = false;
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

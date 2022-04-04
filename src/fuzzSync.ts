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
export function fastFuzz (testFunc, filePath, parameterSchema = null, literals = [], maxTime = 1e4, maxRuns = 1e5, reset = true, verbose = false) {
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
    const start = Date.now();
    let isExpired = false;
    let verboseResult;
    
    try {
      fc.assert(fc.property(arbitrary.filter(args => {
          // Check the running stats for termination.
          if (numRuns % 1e3 == 0) { isExpired = Date.now() - start > maxTime; }
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
          verboseResult = {
            id: numResults,
            mode: mode,
            numRuns: tempRuns,
            speed: (tempRuns / (Date.now() - start)).toPrecision(4),
            isLinesCovered: isCovered(filePath),
            covDiff: JSON.parse(covDiff)
          };
          return true;
        }),
        arg => {
          // Run and store the results.
          let result;
          try {
            result = testFunc(arg);
          } catch (error) {
            result = `Error: ${error.message}`;
          }
          const argResult = {
            arg: arg,
            result: result
          };
          results.push(argResult);

          // Report verbose info to stdout.
          if (verbose) {
            numResults++;
            verboseResult.argResult = argResult;
            console.log(`${JSON.stringify(verboseResult)}`)
          }

          // Keep running.
          return true;
        }
      ),
      {
        verbose: false,
        numRuns: maxRuns,
        ignoreEqualValues: true
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

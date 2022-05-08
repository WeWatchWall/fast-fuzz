import path from "path";
import copy from "fast-copy";
import { diff } from 'deep-object-diff';

import { simpleHash, resetCoverage } from './util';
import { Mode } from "../generators/Mode";
import { Result } from "./result";
import { Globals } from "../utils/globals";
import { Generator } from "../generators/Generator";
import { ModuleMethod } from "../utils/modules";

const MODE_SCALE = 1.5;

// Main fuzzing function that runs the tests and reports the results. 
export async function fuzzAsync(
  method: ModuleMethod,
  getArgs: Function,
  testFunc: Function,
  filePath: string,
  maxTime = 1e4,
  maxRuns = 1e5
) {
  // Resolve the system under test(SUT).
  filePath = path.resolve(filePath);
  if (!global.__coverage__[filePath]) { throw new Error(`File not found: ${filePath}`); }

  resetCoverage(filePath);

  // Scale the number of runs per mode.
  const maxRunsModes: number[] = [];
  const maxMode: number = Mode.High;
  let runsDiff = maxRuns;

  for (let index = maxMode + 1; index > 0; index--) {
    const runsPerMode = runsDiff / index;
    const scaleRuns = Math.floor(runsPerMode * MODE_SCALE);
    maxRunsModes.push(scaleRuns);

    runsDiff -= scaleRuns;
  }

  // Track progress.
  const covResults: Set<string> = new Set();
  const results: Result[] = [];
  const start: number = Date.now();

  // Loop through the modes and fuzz domain.
  let resultCount = 1;
  for (let mode = 0; mode <= maxMode; mode++) {
    // Set the generators to the new mode.
    Generator.mode = mode;
    Globals.mode = mode;

    // Vary the number of runs based on target area.
    let runCount: number = 0;
    const maxRunsMode: number = maxRunsModes.pop();
    const maxRunsCheck: number = Math.pow(10, Math.max(1, Math.floor(Math.log10(maxRunsMode)) - 1));

    // Store coverage pointer for the sake of performance.
    const fileCoverage = {
      b: global.__coverage__[filePath].b,
      bT: global.__coverage__[filePath].bT
    };

    // Test loop stats.
    let isExpired = false;

    while (true) {
      // Check the running stats for termination.
      runCount++;
      if (runCount % maxRunsCheck == 0) { isExpired = (Date.now() - start) > maxTime; }
      if (isExpired || runCount > maxRunsMode) {
        break;
      }

      const covBefore: {
        b: any,
        bT: any
      } = copy(fileCoverage);

      const args: any[] = getArgs();
      let result: any;

      // Run the function and report the error 
      try {
        result = await testFunc(args);
      } catch (error: any) {
        result = error;
      }

      // Hash difference between coverage.
      let covDiff: string = JSON.stringify({
        // f: diff(fileCoverageBefore?.f, fileCoverage.f),
        // s: diff(fileCoverageBefore?.s, fileCoverage.s),
        b: diff(
          covBefore === null || covBefore === void 0 ? void 0 : covBefore.b,
          fileCoverage.b
        ),
        bT: diff(
          covBefore === null || covBefore === void 0 ? void 0 : covBefore.bT,
          fileCoverage.bT
        )
      });
      covDiff = covDiff.replace(/:\d+/g, ":1");
      const coverageHash: string = simpleHash(covDiff);
      
      // Track coverage history.
      if (covResults.has(coverageHash)) {
        continue;
      }
      covResults.add(coverageHash);

      results.push(new Result({
        id: resultCount++,
        instance: method.test.instance,
        args: method.test.callArgs,
        result, mode, coverageHash, runCount,
        speed: Number.parseFloat(
          (runCount * 1000 / (Date.now() - start)).toPrecision(4)
        )
      }));
    }
  }

  resetCoverage(filePath);

  // Report the generated tests.
  return results;
}

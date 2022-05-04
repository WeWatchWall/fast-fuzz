# Test Case Generator Based on Branch Coverage and Fuzzing

[![Build and test status](https://github.com/WeWatchWall/fast-fuzz/workflows/Lint%20and%20test/badge.svg)](https://github.com/WeWatchWall/fast-fuzz/actions?query=workflow%3A%22Lint+and+test%22)
[![NPM version](https://img.shields.io/npm/v/fast-fuzz.svg)](https://www.npmjs.com/package/fast-fuzz)

Library that allows for the generation of unit test argument and result pairs for a given JavaScript function. Uses [IstanbulJS](https://github.com/istanbuljs/istanbuljs) for branch coverage and [Fast-Check](https://github.com/dubzzz/fast-check) for fuzzing.

The [Mocha](https://mochajs.org/) testing framework is recommended. You can use [TS-Mocha](https://www.npmjs.com/package/ts-mocha) (along with the "@types/mocha" and "@types/chai" typings) for tests that are written in TypeScript.
The [Jest](https://jestjs.io/) framework is clobbering the global variable ```global.__coverage__``` and, in general, has trouble in dealing with ESM modules and Typescript.

## Getting Started

```bash
npm i -D fast-fuzz
```

## Usage and Options

Tips:

- The SUT function can be async when called like `await fastFuzzAsync(...args)`. Waiting for any amount of time is very slow overall. Any async code inside the tested logic will need to be awaited until the result is returned; this is for the coverage to be agregated.

- Performance depends on the run time of the tested function(SUT); check that its performance is optimized.

- Coverage is detected only for the file in the arguments. Thus, edge cases will only be detected there. See the [Factory Pattern](https://en.wikipedia.org/wiki/Factory_method_pattern), [SOLID](https://en.wikipedia.org/wiki/SOLID), and [Holywood](https://en.wiktionary.org/wiki/Hollywood_principle) Principles.

- For an easier experience, put all the subject under test literals/constants in an array. The test's literals argument can be updated with any interesting arguments that are detected through the generation process.

- The argument-result pairs can be saved and later compared to pragmatically demonstrate the effects of code changes. Functionality related to this will be added later.

- Coverage results can be visualized by running the [nyc library](https://github.com/istanbuljs/nyc) over the results generated side by side with fast-fuzz.

Example:

```typescript
import { fastFuzz, fastFuzzAsync } from "fast-fuzz";
import { func } from './test/sut/regular.js';

// Faster, meaning it needs less limits, but it only handles sync code across SUT.
let result = fastFuzz(

// OR

// Able to handle async SUT but is slower, meaning it needs more min and/or max limits.
let result = await fastFuzzAsync(
    () => {
      // SUT Function
      return func();
    },
    './test/sut/regular.js',              // SUT File
    [                                     // Argument Structure
      '{"type":"bool"}',
      '{"type":"int","min":0,"max":16}',
      '{"type":"int","min":0}',
      '{"type":"int","min":0}',
      '{"type":"bool"}',
      '{"type":"int","min":0}'
    ],
    [69366, 42808, 5, 26, new Date()],    // Literals/Constants for Stuffing Arguments [Optional]
    1e4,                                  // Time Limit [Optional]
    5e7,                                  // Iterations Limit [Optional]
    true,                                 // Reset Coverage [Optional]
    false                                 // Debug Output to Stdout [Optional]
  );
```

Parameters:

- {function}  method  SUT method calling into the file.

- {relative/absolute path}  filePath Path for the file to be covered. Can provide a default export function.

- {object | array}  parameterSchema Object or Array of parameters to be passed into the SUT function.
  
  - Object options property [Optional]:
  
  ```typescript
    {
      object_options: {
        object_required: ["Key0", 1, "2"], // Overwrites object_partial to mark non-optional properties
        object_partial: true        // All properties are optionally included in the end value.
      },
      ... other object properties here
    }  
  ```

  - Array options object at index 0 [Optional]. If you need a partial, non-shuffled alternative, consider an object with numeric properties { 0: ..., 1: ..., 2: ... }

  ```typescript
    [
      {
        array_partial: true,  // Assumes array_shuffled=true. Returns a possibly shorter combination of elements.
        array_shuffled: true  // Can be used alone to generate shuffled, same-length arrays.
      },
      ... other array elements here
    ]  
  ```

  - Built-in types. The easiest way to generate is to create an example parameter and replace each built-in type with a JSON string according to the following API:
    - ```'{"type":"bool | boolean"}'``` Generates a random boolean.
    - ```'{"type":"int | integer", "min":0, "max":16}'``` Generates a random integer. Min and max are optional.
    - ```'{"type":"float | number", "min":0, "max":1.6}'``` Generates a random floating point number. Min and max are optional.
    - ```'{"type":"date", "min":1633103400000, "max":1633103446168}'``` Generates a random date. Min and max are optional, expressed in milliseconds.
    - ```'{"type":"string", "min":0, "max":16}'``` Generates a random string. Min and max are optional, represents the length.
    - ```null```  Generates a random falsy value.
    - Any other value that is not one of the above, object, or array, will be treated as a constant object.
    - All values are generated acording to the [IstanbulJS Arbitraries API](https://github.com/dubzzz/fast-check/blob/main/documentation/Arbitraries.md).

- {array[built-in types]} literals  [Optional]  Literals or constants of various types. Will be organized by their type and stuffed in the apropiate places. For example, one needs both 1.0 for integers and 1.0001 for float stuffing. Default = []

- {number}  maxTime [Optional]  Maximum run time in ms for each round of fuzzing, of which there are 4. Default = 1e4(10s)

- {number}  maxRuns [Optional]  Maximum iterations for each round of fuzzing, of which there are 4. Default = 10,000

- {boolean} reset  [Optional]  Reset the coverage aggregates in ```global.__coverage__[fileName]```. Default = true

- {boolean} verbose  [Optional]  Output debug info about generation to stderr. Default = false

## Results

```typescript
result = {
  coverage: global.__coverage__,          // Deep copy of the global IstanbulJS coverage object.
  tests: [
    {
      arg: ...,                           // Generated conforming to Argument Structure parameter.
      result: ...                         // Generated by Running the SUT function. Can be an Exception.
    },
    ...
  ]
};
```

The verbose mode outputs this:

```typescript
{
  "id": 1                 // New test entry index
  "mode": 0,              // Mode [0]: stuffing & falsy, [1-3]: small potatoes, 4: full
  "numRuns": 1,           // Iterations counter
  "speed": 4,             // Iterations / Mode Time
  "isLinesCovered": false // All branches and conditions return true after this test.,
  "argResult": {
    "arg": ...,           // Test args object / array
    "result": ...         // Test result / exception
  },
  "covDiff": {            // Branches satisfied by this test.
    "b": {
      "0": {
          "1": 1
      },
      "5": {
          "0": 1
      },
      "6": {
          "0": 1
      }
    },
    "bT": {               // Logical conditions satisfied by this test.
      "6": {              // (Ammended IstanbulJS with logical evaluation.)
          "0": 1
      }
    }
  }
}
```

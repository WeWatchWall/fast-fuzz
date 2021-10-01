# Test Case Generator Based on Branch Coverage and Fuzzing

[![Build and test status](https://github.com/WeWatchWall/fast-fuzz/workflows/Lint%20and%20test/badge.svg)](https://github.com/WeWatchWall/fast-fuzz/actions?query=workflow%3A%22Lint+and+test%22)
[![NPM version](https://img.shields.io/npm/v/fast-fuzz.svg)](https://www.npmjs.com/package/fast-fuzz)

Library that allows for the generation of unit test argument and result pairs for a given JavaScript function. Uses [IstanbulJS](https://github.com/istanbuljs/istanbuljs) for branch coverage and [Fast-Check](https://github.com/dubzzz/fast-check) for fuzzing.

Mainly tested with the [Mocha](https://mochajs.org/) testing framework. The [Jest](https://jestjs.io/) framework is clobbering the global variable ```global.__coverage__``` so any help on that failed integration is most appreciated.

## Getting Started

```bash
npm i fast-fuzz
```

## Usage and Options

Tips:

- Performance depends on the run time of the tested function, so check that it is optimized.

- Coverage is detected only for the file in the arguments. Thus, edge cases will only be detected there. See the [Factory Pattern](https://en.wikipedia.org/wiki/Factory_method_pattern), [SOLID](https://en.wikipedia.org/wiki/SOLID), and [Holywood](https://en.wiktionary.org/wiki/Hollywood_principle) Principles.

- For an easier experience, put all the subject under test(SUT) literals/constants in an array. The test's literals argument can be updated with any interesting arguments that are detected through the generation process.

- The argument-result pairs can be saved and later compared to pragmatically demonstrate the effects of code changes. Functionality related to this may be added later.

- Coverage results can be visualized with the [IstanbulJS API](https://medium.com/@kushmisra7/one-report-for-all-test-cases-easily-merging-multiple-tests-reports-b0f5e5211a2a). Any help is appreciated for integrating this into the tool.

- The SUT function needs to be externally synchornized. This means that any async code inside the tested logic needs to be awaited until the result is returned; this is for the coverage to be agregated.

Example:

```typescript
import { fastFuzz } from "fast-fuzz";

let result = fastFuzz(
    './test/sut/regular.js',              // SUT File
    'regular',                            // SUT's Function [Optional]
    [                                     // Argument Structure
      '{"type":"bool"}',
      '{"type":"int","min":0,"max":16}',
      '{"type":"int","min":0}',
      '{"type":"int","min":0}',
      '{"type":"bool"}',
      '{"type":"int","min":0}'
    ],
    [69366, 42808, 5, 26],                // Literals/Constants for Stuffing Arguments [Optional]
    1e4,                                  // Time Limit [Optional]
    5e7,                                  // Iterations Limit [Optional]
    true,                                 // Reset Coverage [Optional]
    false                                 // Debug Output to Stdout [Optional]
  );
```

Parameters:

- {relative/absolute path}  filePath Path for the file to be covered. Can provide a default export function.

- {string}  methodName  [Optional]  Name of specific SUT method if the file has no default. Default = null

- {object | array}  parameterSchema Object or Array of parameters to be passed into the SUT function. The easiest way to generate is to create an example parameter and replace each built-in type with a JSON string according to the following API:
  
  - ```'{"type":"bool | boolean"}'``` Generates a random boolean.
  - ```'{"type":"int | integer", "min":0, "max":16}'``` Generates a random integer. Min and max are optional.
  - ```'{"type":"float | number", "min":0, "max":1.6}'``` Generates a random floating point number. Min and max are optional.
  - ```'{"type":"date", "min":new Date().getTime(), "max":new Date().getTime()}'``` Generates a random date. Min and max are optional, expressed in milliseconds.
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
1 // New test entry index
{
    "mode": 0,              // Mode [0]: stuffing & falsy, [1-3]: small potatoes, 4: full
    "numRuns": 1,           // Iterations counter
    "speed": 4,             // Mode Time / Iterations
    "isLinesCovered": false // All branches and conditions return true after this test.
}
{                           // Branches satisfied by this test.
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
    "bT": {                 // Logical conditions satisfied by this test. (Ammended IstanbulJS with logical evaluation)
        "6": {
            "0": 1
        }
    }
}
{
  "arg": ...,               // Test args object / array
  "result": ...             // Test result / exception
}
```

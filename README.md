# Fast-Fuzz, the First Smart Fuzzing Framework for Typescript

[![Build and test status](https://github.com/WeWatchWall/fast-fuzz/workflows/Lint%20and%20test/badge.svg)](https://github.com/WeWatchWall/fast-fuzz/actions?query=workflow%3A%22Lint+and+test%22)
[![NPM version](https://img.shields.io/npm/v/fast-fuzz.svg)](https://www.npmjs.com/package/fast-fuzz)

Fuzzing framework that allows for the generation of unit test argument and result pairs for a given Typescript project. Uses [IstanbulJS](https://github.com/istanbuljs/istanbuljs) for branch coverage and [class-transformer](https://github.com/typestack/class-transformer) for type instance generation.

The [Mocha](https://mochajs.org/) testing framework is recommended. You can use [TS-Mocha](https://www.npmjs.com/package/ts-mocha) (along with the "@types/mocha" and "@types/chai" typings) for tests that are written in TypeScript.

## Getting Started

```bash
npm install fast-fuzz
npm install --save-dev reflect-metadata
```

Fast-Fuzz installs in the ```dependencies``` and not ```devDependencies``` because it relies on decorators.
Fast-Fuzz cannot be installed globally with ```npm i -g fast-fuzz``` because it depends on shared state to track the decorators.

The project requires ```reflect-metadata``` in the fuzzed project. Further, the target also needs:

- To be a Typescript project with a ```src``` and ```dist``` folder. These can be set through options.
- ```tsconfig.json``` enables decorators:
  
  ```typescript
  {
    "compilerOptions": {
      ...
      "experimentalDecorators": true,
      "emitDecoratorMetadata": true,
      ...
    }
  }
  ```

- Typings ```.d.ts``` files are generated in the ```dist``` folder by adding the following to ```tsconfig.json```:

```typescript
{
  "compilerOptions": {
    ...
    "declaration": true, 
    ...
  }
}
```

- The code analyzer expects several code idiosyncrasies that are described below.

## Usage and Options

There are two ways to invoke the fast-fuzz package:

- Through code:

```typescript
import { fuzz } from 'fast-fuzz';

async Main () {
  await fuzz(
    projectFolder,
    threads,          // [Optional] Default = OS defined. 0 for in-process.
    maxTime,          // [Optional] Default = 10s.
    methods, classes, // [Optional] Default = all.
    files,            // [Optional] Default = all.
    source, dist,     // [Optional] Default = 'src' and 'dist'.
    verbose,          // [Optional] Default = false.
    force,            // [Optional] Default = false.
    // [Optional] For intermediate results before the promise resolves.
    resultsOut
  );
}
Main();
```

- Command line (from within the package.json scripts):

```bash
fast-fuzz
  -i, --input <path>            Path of the Typescript project.

  Optional:
  -V, --version                 Output the version number
  -p, --threads <count>         The number of parallel threads.
                                  Default = OS defined. 0 for in-process.
  -t, --maxTime <milliseconds>  The maximum time(ms) per function. Default = 10 min.
  -m, --methods <RegExp>        A Regex expression to filter the methods to test.
  -c, --classes <RegExp>        A Regex expression to filter the classes to test.
  -f, --files <RegExp>          A Regex expression to filter the files to test.
  -s, --source <path>           Path of the source folder relative to the project.
  -d, --dist <path>             Path of the binary folder relative to the project.
  -q, --quiet true              Only output the results JSON
  -F, --force true              Force overwrite fuzzInstances.json.
  -h, --help                    Display help for command
```

The target code usually needs to be decorated with:

- Property decorators. This is how objects are created!

```typescript
import { fuzzProp } from 'fast-fuzz';

export class Foo {
  
  @fuzzProp(
    'boolean' | 'integer' | 'float' | 'date' | 'string'
    dimension, // Dimension of array. For single value (default) = 0.
    
    // Only for built-in types.
    min,
    max
  )
  bar: Bar;
}
```

Use the ```@fuzzPropType(Class.name, dimension)``` decorator for custom types, abstract, and interfaces.
Properties can be set to ```undefined``` or ```null``` using the ```@fuzzSkipProp``` decorator.

- Method and argument decorators :

```typescript
import { fuzzMethod, fuzzArg } from 'fast-fuzz';

export class Foo {
  
  @fuzzMethod  // Always necessary to pick up the method, logs an error if it's missing.
  bar (
    @fuzzArg('built-in') arg: Bar // Same API as the property.
  ) {
    return arg;
  }
}
```

Use the ```@fuzzArgType(Class.name, dimension)``` decorator for custom types, abstract, and interfaces.
Methods can be skipped from testing using the ```@fuzzSkipMethod``` decorator.

Arguments can be set to ```undefined``` or ```null``` using the ```@fuzzSkipArg``` decorator.

Without decoration, it is still able to fuzz any classes that have properties *and* methods
with arguments that are restricted to only built-in types (excluding Date).
However, the values do not have limits so they will take much longer to test.

The framework writes a fuzzInstances.json file in the folder with a dictionary of
instances organized by file and type. This file is not overwritten once it exists
unless the force flag is applied. These instances are useful for stuffing where their
type is required in subsequent runs. Said differently, this allows for some integration
testing between functions.

For now, the detection of interesting arguments only applies to arguments and not their
nested objects. Using single responsibility from the SOLID design principles, this means
adding any function that deals with an object's state directly inside that object
or at least separately. Another option is that the user can manually update the
fuzzInstances.json file with those nested argument objects.

By setting the threads option to 0, the results of the fuzzing are the original objects,
and can thus be reused in other code.

## Code Style Tips

### Types

- Type arguments for arguments and properties not yet tested, e.g. ```function Foo(arg: Bar<Type>) {}```.
- Function types for arguments and properties not yet tested, e.g. ```function Foo(arg: () => Type) {}```.
- Types that are not included in the sources are probably going to cause problems.
- Export types for testing.
- Types in different files should not be named the same. This might be fixed soon.
- Type declarations with similar names should be ordered alphabetically, especially for similar names.
- Imported types should be ordered alphabetically, especially for similar names.
- Use static classes instead of namespaces to include their methods in the fuzzing.

### Methods

- Don't name static methods the same as instance ones.
- Order methods with similar names alphabetically.
- Return types should not contain brackets ```( or )``` because they are used to detect method signatures.
- Async methods are drastically slower if there is any sort of waiting.
- Constructors are skipped for now, and objects are constructed from their properties.

### Literals

- Literals that are used for comparison to arguments should be left in the method. These are used by the fuzzer to stuff the arguments' values.
- All unrelated literals should be put at the beginning of the file.
- Any methods that are not exported or within a class should not contain literals as these will be picked up by the earlier fuzzed method in the file. Another option is to put ineligible methods before the fuzzed ones.

## TODO

- Redundant runner for the args-results pairs.
- Stuffing for nested type args by registration of generators and collection of values upon successful detection.
- Option to run the constructors.
- Get rid of the Intermock dependency and allow same type names across files.

import { createInstrumenter } from 'istanbul-lib-instrument';
import { hookRequire } from 'istanbul-lib-hook';

import path from 'path';

import { Globals } from '../utils/globals';
import { Code } from '../utils/code';

import { fuzzAsync } from './fuzzAsync';
import { fuzzSync } from './fuzzSync';
import { GeneratorArg } from '../generators/GeneratorArg';
import { GeneratorFactory } from '../generators/GeneratorFactory';
import { IGenerator } from '../generators/IGenerator';
import { Mode } from '../generators/Mode';
import { ModuleMethod, ModuleType } from '../utils/modules';
import { Result, Results } from './result';

/* #region  Instrumenter hook. */
let instrumenter: any;

hookRequire((_filePath) => true, (code, { filename }) => {
  if (filename.includes('node_modules')) {
    return code;
  }

  const newCode = instrumenter.instrumentSync(code, filename);
  return newCode;
});
/* #endregion */

/* #region  Local variables. */
let currentFolder: string;
let interfaces: [string, string][];
let instances: {
  args: any[],
  callTypes: {
    index: number,
    dimension: number,
    types: ModuleType[]
  }[]
}[] = [];
/* #endregion */

/**
 * Inits the local code analysis and type stuffing.
 * @param folder @type {string} 
 * @param [src] @type {string} 
 * @param [dist] @type {string} 
 * @param [instances] @type {any} 
 */
export async function init(
  folder: string,
  src?: string,
  dist?: string,
  instances?: any
): Promise<void> {
  if (instances !== undefined) {
    Globals.instances = instances;
  }

  await initLocal(folder, src, dist);
}

/**
 * Inits the local code analysis.
 * @param folder @type {string} 
 * @param [src] @type {string} 
 * @param [dist] @type {string} 
 */
async function initLocal(
  folder: string,
  src = 'src/',
  dist = 'dist/',
): Promise<void> {
  if (
    currentFolder !== undefined &&
    currentFolder === folder
  ) { return; }

  Globals.isTest = true;

  Globals.codeUtil = new Code();
  await Globals.codeUtil.init(
    path
      .join(folder, src)
      .replace(new RegExp('\\\\', 'g'), '/')
      .replace(new RegExp('\\\\\\\\', 'g'), '/'),
    path
      .join(folder, dist)
      .replace(new RegExp('\\\\', 'g'), '/')
      .replace(new RegExp('\\\\\\\\', 'g'), '/')
  );

  instrumenter = createInstrumenter({ compact: true, reportLogic: true });
  await Globals.codeUtil.load();

  currentFolder = folder;
}

/**
 * Check that the instrumentation is initialized.
 */
function checkInit(): void {
  if (instrumenter === undefined) {
    throw new Error('The Fuzz method only runs after calling init. ');
  }
}

/**
 * Counts the number of methods.
 * @param [methodPattern] @type {RegExp} 
 * @param [classPattern] @type {RegExp} 
 * @param [filePattern] @type {RegExp} 
 * @returns count of methods.
 */
export async function count(
  methodPattern?: string,
  classPattern?: string,
  filePattern?: string
): Promise<number> {
  checkInit();

  let methodCount = 0;
  for (const [file, methods] of Object.entries(Globals.codeUtil.methods)) {
    if (filePattern !== undefined && !(new RegExp(filePattern)).test(file)) {
      continue;
    }

    for (const method of methods) {
      if (classPattern !== undefined && !(new RegExp(classPattern)).test(method.className)) {
        continue;
      }
      if (methodPattern !== undefined && !(new RegExp(methodPattern)).test(method.name)) {
        continue;
      }
      if (method.name === '__constructor') { continue; }

      methodCount++;
    }
  }

  return methodCount;
}

/**
 * Fuzz the TS folder.
 * @param [maxTime] @type {number} 
 * @param [methodPattern] @type {RegExp} 
 * @param [classPattern] @type {RegExp} 
 * @param [filePattern] @type {RegExp} 
 * @param [resultsOut] @type {Results[]} 
 */
export async function fuzz(
  maxTime = 1e4,
  methodPattern?: string,
  classPattern?: string,
  filePattern?: string,
  resultsOut: Results[] = [],
  index = 0,
  count = 0
): Promise<Results[]> {
  let currentCount = 0;
  let currentIndex = 0;

  checkInit();

  interfaces = Object.values(Globals.codeUtil.interfaces);

  for (const [file, methods] of Object.entries(Globals.codeUtil.methods)) {
    if (filePattern !== undefined && !(new RegExp(filePattern)).test(file)) {
      continue;
    }

    for (const method of methods) {
      /* #region  Method filtering. */
      if (classPattern !== undefined && !(new RegExp(classPattern)).test(method.className)) {
        continue;
      }

      if (methodPattern !== undefined && !(new RegExp(methodPattern)).test(method.name)) {
        continue;
      }
      if (method.name === '__constructor') { continue; }
      /* #endregion */

      /* #region  Check the resume state and skip those methods. */
      if (count !== 0 && currentCount >= count) {
        break;
      }
      if (currentIndex < index) {
        currentIndex++;
        continue;
      }

      currentIndex++;
      currentCount++;
      /* #endregion */

      // Set the generators to reset with the new literals.
      Globals.literals = method.literals;

      // Benchmark for number of runs in the specified time.
      const maxRuns = await getMaxRuns(method, file, maxTime);

      // Run the appropiate static & async method
      const fuzzResults: Result[] = await fuzzAnyMethod(method, file, maxTime, maxRuns);

      // Output the method results.
      resultsOut.push({
        name: method.name,
        className: method.className,
        namespaces: method.namespaces,
        file,
        avgSpeed: maxRuns / maxTime,
        results: fuzzResults
      });

      // Collect the instances.
      loadInstances(instances, Globals.instances);
      instances = [];
    }
  }

  return resultsOut;
}


/**
 * Gets max runs from 1000, in 10% of the time.
 * @param method @type {ModuleMethod} 
 * @param file @type {string} 
 * @param maxTime @type {number} 
 * @returns maxRuns @type {number} 
 */
async function getMaxRuns(
  method: ModuleMethod,
  file: string,
  maxTime: number
): Promise<number> {
  const numRuns = 1e3;
  const start = Date.now();

  await fuzzAnyMethod(method, file, maxTime / 10, numRuns);
  const result = Math.floor(maxTime / ((Date.now() - start) / numRuns));

  return Math.max(numRuns, result);
}

/**
 * Fuzzes any method.
 * @param method @type {ModuleMethod} 
 * @param file @type {string} 
 * @param maxTime @type {number} 
 * @param maxRuns @type {number} 
 * @returns @type {Result[]} 
 */
async function fuzzAnyMethod(
  method: ModuleMethod,
  file: string,
  maxTime: number,
  maxRuns: number
): Promise<Result[]> {
  Globals.methodCount++;
  let fuzzResults: Result[] = [];
  if (method.isStatic || method.className === undefined) {
    if (method.isAsync) {
      fuzzResults = await fuzzStaticAsync(file, method, maxTime, maxRuns, fuzzResults);
    } else {
      fuzzResults = fuzzStatic(file, method, maxTime, maxRuns, fuzzResults);
    }
  } else {
    if (method.isAsync) {
      fuzzResults = await fuzzMethodAsync(file, method, maxTime, maxRuns, fuzzResults);
    } else {
      fuzzResults = fuzzMethod(file, method, maxTime, maxRuns, fuzzResults);
    }
  }
  return fuzzResults;
}

/**
 * Fuzz static methods.
 * @param filePath @type {string} 
 * @param method @type {ModuleMethod} 
 * @param [maxTime] @type {number} 
 * @param [maxRuns] @type {number} 
 * @param resultsOut @type {Result[]} 
 * @returns results @type {Result[]} 
 */
function fuzzStatic(
  filePath: string,
  method: ModuleMethod,
  maxTime = 1e4,
  maxRuns = 1e5,
  resultsOut: Result[]
): Result[] {
  // Init the arg generator.
  interfaces.push(method.IArgs);
  const argGenerator = new GeneratorArg(interfaces);

  /* #region  Get the static method. */
  const type: ModuleType =
    Globals
      .codeUtil
      .types[filePath]
      .find((moduleType: ModuleType) =>
        moduleType.name === method.className
      );

  let func: any = Globals.codeUtil.modules[filePath];
  type.namespaces.forEach((namespace: string) => {
    func = func[namespace];
  });
  if (method.className !== undefined) {
    func = func[method.className];
  }
  func = func[method.name];
  /* #endregion */

  const results = fuzzSync(
    method,
    () => getArgs(method, argGenerator),
    (args: any[]) => func(...args),
    filePath,
    maxTime,
    maxRuns,
    resultsOut,
    () => {
      if (Globals.mode <= Mode.Stuff) { return; }

      instances.push({
        args: method.test.callArgs,
        callTypes: method.test.callArgsTypes
      });
    }
  );

  interfaces.pop();

  return results;
}

/**
 * Fuzz static methods async.
 * @param filePath @type {string} 
 * @param method @type {ModuleMethod} 
 * @param [maxTime] @type {number} 
 * @param [maxRuns] @type {number} 
 * @param resultsOut @type {Result[]} 
 * @returns results @type {Result[]} 
 */
async function fuzzStaticAsync(
  filePath: string,
  method: ModuleMethod,
  maxTime = 1e4,
  maxRuns = 1e5,
  resultsOut: Result[]
): Promise<Result[]> {
  // Init the arg generator.
  interfaces.push(method.IArgs);
  const argGenerator = new GeneratorArg(interfaces);

  /* #region  Get the static method. */
  const type: ModuleType =
    Globals
      .codeUtil
      .types[filePath]
      .find((moduleType: ModuleType) =>
        moduleType.name === method.className
      );

  let func: any = Globals.codeUtil.modules[filePath];
  type.namespaces.forEach((namespace: string) => {
    func = func[namespace];
  });
  if (method.className !== undefined) {
    func = func[method.className];
  }
  func = func[method.name];
  /* #endregion */

  const results = await fuzzAsync(
    method,
    () => getArgs(method, argGenerator),
    async (args: any[]) => await func(...args),
    filePath,
    maxTime,
    maxRuns,
    resultsOut,
    () => {
      if (Globals.mode <= Mode.Stuff) { return; }

      instances.push({
        args: method.test.callArgs,
        callTypes: method.test.callArgsTypes
      });
    }
  );

  interfaces.pop();

  return results;
}

/**
 * Fuzz methods.
 * @param filePath @type {string} 
 * @param method @type {ModuleMethod} 
 * @param [maxTime] @type {number} 
 * @param [maxRuns] @type {number} 
 * @param resultsOut @type {Result[]} 
 * @returns results @type {Result[]} 
 */
function fuzzMethod(
  filePath: string,
  method: ModuleMethod,
  maxTime = 1e4,
  maxRuns = 1e5,
  resultsOut: Result[]
): Result[] {
  // Init the arg generator.
  interfaces.push(method.IArgs);
  const argGenerator = new GeneratorArg(interfaces);

  const type: ModuleType =
    Globals
      .codeUtil
      .types[filePath]
      .find((moduleType: ModuleType) =>
        moduleType.name === method.className
      );

  method.test.instanceType = type;

  let isIncrement = false;
  let generator: IGenerator =
    GeneratorFactory.initType(type, 0, 0, Mode.Stuff, true);

  const results = fuzzSync(
    method,
    () => getArgs(method, argGenerator),
    (args: any[]) => {
      // debugger;
      // const instance = generator.next();
      // const func = instance[method.name];
      // const result = func(...args);
      if (!isIncrement && Globals.mode > Mode.Stuff) {
        isIncrement = true;
        generator = GeneratorFactory.initType(type, 0, 0, Mode.Low_2, true);
      }

      method.test.instance = generator.next();
      return method.test.instance[method.name](...args);
    },
    filePath,
    maxTime,
    maxRuns,
    resultsOut,
    () => {
      if (Globals.mode <= Mode.Stuff) { return; }

      instances.push({
        args: method.test.callArgs,
        callTypes: method.test.callArgsTypes
      });
      instances.push({
        args: [method.test.instance],
        callTypes: [{
          index: 0,
          dimension: 0,
          types: [type]
        }]
      });
    }
  );

  interfaces.pop();

  return results;
}

/**
 * Fuzz methods async.
 * @param filePath @type {string} 
 * @param method @type {ModuleMethod} 
 * @param [maxTime] @type {number} 
 * @param [maxRuns] @type {number} 
 * @param resultsOut @type {Result[]} 
 * @returns results @type {Result[]} 
 */
async function fuzzMethodAsync(
  filePath: string,
  method: ModuleMethod,
  maxTime = 1e4,
  maxRuns = 1e5,
  resultsOut: Result[]
): Promise<Result[]> {
  // Init the arg generator.
  interfaces.push(method.IArgs);
  const argGenerator = new GeneratorArg(interfaces);

  const type: ModuleType =
    Globals
      .codeUtil
      .types[filePath]
      .find((moduleType: ModuleType) =>
        moduleType.name === method.className
      );

  method.test.instanceType = type;

  let isIncrement = false;
  let generator: IGenerator =
    GeneratorFactory.initType(type, 0, 0, Mode.Stuff, true);

  const results = await fuzzAsync(
    method,
    () => getArgs(method, argGenerator),
    async (args: any[]) => {
      // debugger;
      // const instance = generator.next();
      // const func = instance[method.name];
      // const result = func(...args);
      if (!isIncrement && Globals.mode > Mode.Stuff) {
        isIncrement = true;
        generator = GeneratorFactory.initType(type, 0, 0, Mode.Low_2, true);
      }

      method.test.instance = generator.next();
      return await method.test.instance[method.name](...args);
    },
    filePath,
    maxTime,
    maxRuns,
    resultsOut,
    () => {
      if (Globals.mode <= Mode.Stuff) { return; }

      instances.push({
        args: method.test.callArgs,
        callTypes: method.test.callArgsTypes
      });
      instances.push({
        args: [method.test.instance],
        callTypes: [{
          index: 0,
          dimension: 0,
          types: [type]
        }]
      });
    }
  );

  interfaces.pop();

  return results;
}

/**
 * Gets args.
 * @param method @type {ModuleMethod} 
 * @param generator @type {GeneratorArg} 
 * @returns args @type {any[]} 
 */
function getArgs(method: ModuleMethod, generator: GeneratorArg): any[] {
  // Set the method to generate new arguments.
  method.test.isStart = true;
  method.test.callArgsTypes = [];

  const resultObject: any = generator.next();

  const result: any[] = [];
  method.args.forEach((arg: string) => {
    result.push(resultObject[arg]);
  });
  method.test.callArgs = result;

  return result;
}

/**
 * Loads instances after every method fuzz.
 * @param instances @type {any[]}
 * @param instancesOut @type {any}
 */
function loadInstances(
  instances: {
    args: any[],
    callTypes: {
      index: number,
      dimension: number,
      types: ModuleType[]
    }[]
  }[],
  instancesOut: {
    [key: string]: {
      [key: string]: {
        instances: any[]
      }
    }
  }
): void {
  instances.forEach(instance => {
    if (
      instance === undefined ||
      instance.args === undefined ||
      instance.args.length === 0
    ) { return; }

    instance.callTypes.forEach(callType => {
      let arg = instance.args[callType.index];

      if (
        arg === undefined ||
        callType.types === undefined ||
        callType.types.length === 0
      ) { return; }

      if (callType.dimension === 0) { arg = [arg]; }
      else { arg = arg.flat(); }

      for (let index = 0; index < arg.length; index++) {
        const argElement = arg[index];
        const typeElement: ModuleType = callType.types[index];

        if (instancesOut[typeElement.file] === undefined) {
          instancesOut[typeElement.file] = {};
        }
        if (instancesOut[typeElement.file][typeElement.name] === undefined) {
          instancesOut[typeElement.file][typeElement.name] = {
            // type: typeElement,
            instances: []
          };
        }

        instancesOut[typeElement.file][typeElement.name]
          .instances
          .push(argElement);
      }
    });
  });
}

/**
 * Gets instances.
 * @returns instances @type {any} 
 */
export async function getInstances(): Promise<any> {
  return Globals.instances;
}

import { createInstrumenter } from 'istanbul-lib-instrument';
import { hookRequire } from 'istanbul-lib-hook';

import fs from 'fs';
import path from 'path';
import safeStringify from 'fast-safe-stringify';
import logUpdate from 'log-update';

import { Globals } from '../utils/globals';
import { Code } from '../utils/code';

import { fuzzSync } from './fuzzSync';
import { ModuleMethod, ModuleType } from '../utils/modules';
import { Result, Results } from './result';
import { IGenerator } from '../generators/IGenerator';
import { GeneratorFactory } from '../generators/GeneratorFactory';
import { Mode } from '../generators/Mode';
import { fuzzAsync } from './fuzzAsync';
import { GeneratorArg } from '../generators/GeneratorArg';

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

let interfaces: [string, string][];

let instancesPath: string;
let instances: {
  args: any[],
  callTypes: {
    index: number,
    dimension: number,
    types: ModuleType[]
  }[]
}[] = [];

export async function fastFuzz(
  folder: string,
  maxTime = 1e4,
  maxRuns = 1e5,
  methodPattern?: string,
  classPattern?: string,
  src?: string,
  dist?: string,
  verbose = false,
  force = false,
  resultsOut: Results[] = []
): Promise<Results[]> {
  if (instrumenter === undefined) {
    await init(folder, src, dist);
  }

  interfaces = Object.values(Globals.codeUtil.interfaces);

  /* #region  Output verbose info. */
  if (verbose) {
    let methodCount = 0;
    for (const [, methods] of Object.entries(Globals.codeUtil.methods)) {
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

    logUpdate(`
      Method count: ${methodCount},
      Estimated time (s): ${methodCount * maxTime / 1000}
    `);
    logUpdate.done();
  }
  /* #endregion */

  for (const [file, methods] of Object.entries(Globals.codeUtil.methods)) {
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

      // Set the generators to reset with the new literals.
      Globals.methodCount++;
      Globals.literals = method.literals;

      // Run the appropiate static & async method
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

      // Output the method results.
      resultsOut.push({
        name: method.name,
        className: method.className,
        namespaces: method.namespaces,
        file,
        results: fuzzResults
      });

      // Collect the instances.
      getInstances(instances, Globals.instances);
      instances = [];
    }
  }

  saveInstances({ force, instances: Globals.instances });
  return resultsOut;
}

async function init(
  folder: string,
  src = 'src/',
  dist = 'dist/',
) {
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

  instrumenter = createInstrumenter({ compact: true, reportLogic: true })
  await Globals.codeUtil.load();

  // Load the instances file.
  instancesPath = path.join(folder, '/fuzzInstances.json');
  if (!fs.existsSync(instancesPath)) { return; }
  Globals.instances = JSON.parse(fs.readFileSync(instancesPath, 'utf8'));
}

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

function getInstances(
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
) {
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

function saveInstances({ force, instances }: {
  force: boolean;
  instances: {
    [key: string]: {
      [key: string]: {
        instances: any[];
      };
    };
  };
}) {
  if (!force && fs.existsSync(instancesPath)) { return; }

  const output = safeStringify(instances);

  fs.writeFileSync(instancesPath, output);
}

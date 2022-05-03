import { createInstrumenter } from 'istanbul-lib-instrument';
import { hookRequire } from 'istanbul-lib-hook';

import path from 'path';

import { Globals } from '../utils/globals';
import { Code } from '../utils/code';

import { fuzzSync } from './fuzzSync';
import { ModuleMethod, ModuleType } from '../utils/modules';
import { Result, Results } from './result';
import { mock } from 'intermock';
import { IGenerator } from '../generators/IGenerator';
import { GeneratorFactory } from '../generators/GeneratorFactory';
import { Mode } from '../generators/Mode';
import { fuzzAsync } from './fuzzAsync';

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

var interfaces: [string, string][];

export async function fuzz(): Promise<Results[]> {
  if (instrumenter === undefined) {
    await init();
  }

  interfaces = Object.values(Globals.codeUtil.interfaces);

  const results: Results[] = [];

  for (const [file, methods] of Object.entries(Globals.codeUtil.methods)) {
    for (const method of methods) {
      if (method.name === '__constructor') { continue; }

        // Set the generators to reset with the new literals.
        Globals.methodCount++;
        Globals.literals = method.literals;

        let fuzzResults: Result[];
        if (method.isStatic || method.className === undefined) {
          if (method.isAsync) {
            fuzzResults = await fuzzStaticAsync(file, method, 1e4, 1e5);
          } else {
            fuzzResults = fuzzStatic(file, method, 1e4, 1e5);
          }
        } else {
          if (method.isAsync) {
            fuzzResults = await fuzzMethodAsync(file, method, 1e4, 1e5);
          } else {
            fuzzResults = fuzzMethod(file, method, 1e4, 1e5);
          }
        }

        results.push({
          name: method.name,
          className: method.className,
          namespaces: method.namespaces,
          file,
          results: fuzzResults
        });
    }
  }

  return results;
}

async function init() {
  Globals.isTest = true;

  Globals.codeUtil = new Code();
  await Globals.codeUtil.init(
    path
      .join(process.argv[2], 'src/')
      .replace(new RegExp('\\\\', 'g'), '/')
      .replace(new RegExp('\\\\\\\\', 'g'), '/'),
    path
      .join(process.argv[2], 'dist/')
      .replace(new RegExp('\\\\', 'g'), '/')
      .replace(new RegExp('\\\\\\\\', 'g'), '/')
  );

  instrumenter = createInstrumenter({ compact: true, reportLogic: true })
  await Globals.codeUtil.load();
}

function getArgs(method: ModuleMethod): any[] {
  // Set the method to generate new arguments.
  method.test.isStart = true;

  const resultObject: any = mock({
    files: interfaces,
    interfaces: ['IFuzzArgs'],
    isOptionalAlwaysEnabled: true,
    output: 'object'
  })['IFuzzArgs'];

  const result: any[] = [];
  method.args.forEach((arg: string) => {
    result.push(resultObject[arg]);
  });

  return result;
}

function fuzzStatic(
  filePath: string,
  method: ModuleMethod,
  maxTime: number = 1e4,
  maxRuns: number = 1e5
): Result[] {
  interfaces.push(method.IArgs);

  let func: any = Globals.codeUtil.modules[filePath];
  func.namespaces.forEach((namespace: string) => {
    func = func[namespace];
  });
  if (method.className !== undefined) {
    func = func[method.className];
  }
  func = func[method.name];

  const results = fuzzSync(
    method,
    () => getArgs(method),
    (args: any[]) => func(...args),
    filePath,
    maxTime,
    maxRuns
  );

  interfaces.pop();

  return results;
}

async function fuzzStaticAsync(
  filePath: string,
  method: ModuleMethod,
  maxTime: number = 1e4,
  maxRuns: number = 1e5
): Promise<Result[]> {
  interfaces.push(method.IArgs);

  let func: any = Globals.codeUtil.modules[filePath];
  func.namespaces.forEach((namespace: string) => {
    func = func[namespace];
  });
  if (method.className !== undefined) {
    func = func[method.className];
  }
  func = func[method.name];

  const results = await fuzzAsync(
    method,
    () => getArgs(method),
    async (args: any[]) => await func(...args),
    filePath,
    maxTime,
    maxRuns
  );

  interfaces.pop();

  return results;
}

function fuzzMethod(
  filePath: string,
  method: ModuleMethod,
  maxTime: number = 1e4,
  maxRuns: number = 1e5
): Result[] {
  interfaces.push(method.IArgs);

  let type: ModuleType =
    Globals
      .codeUtil
      .types[filePath]
      .find((moduleType: ModuleType) =>
        moduleType.name === method.className
      );

  const generator: IGenerator =
    GeneratorFactory.initType(type, 0, 0, Mode.Stuff);

  const results = fuzzSync(
    method,
    () => getArgs(method),
    (args: any[]) => {
      // debugger;
      // const instance = generator.next();
      // const func = instance[method.name];
      // const result = func(...args);
      method.test.instance = generator.next();
      return method.test.instance[method.name](...args);
    },
    filePath,
    maxTime,
    maxRuns
  );

  interfaces.pop();

  return results;
}

async function fuzzMethodAsync(
  filePath: string,
  method: ModuleMethod,
  maxTime: number = 1e4,
  maxRuns: number = 1e5
): Promise<Result[]> {
  interfaces.push(method.IArgs);

  let type: ModuleType =
    Globals
      .codeUtil
      .types[filePath]
      .find((moduleType: ModuleType) =>
        moduleType.name === method.className
      );

  const generator: IGenerator =
    GeneratorFactory.initType(type, 0, 0, Mode.Stuff);

  const results = await fuzzAsync(
    method,
    () => getArgs(method),
    async (args: any[]) => {
      // debugger;
      // const instance = generator.next();
      // const func = instance[method.name];
      // const result = func(...args);
      method.test.instance = generator.next();
      return await method.test.instance[method.name](...args);
    },
    filePath,
    maxTime,
    maxRuns
  );

  interfaces.pop();

  return results;
}
import { Transform } from 'class-transformer';
import { Generator } from './generators/Generator';

import { IGenerator } from "./generators/IGenerator";
import { BuiltIn, ArgsDecorator } from "./utils/decorators";
import { Globals } from "./utils/globals";

export namespace Fuzz {

  export const prop = function (type: BuiltIn, dimension: number = 0, min?: number, max?: number): PropertyDecorator {
    return (
      target: Object,
      key: string | symbol
    ) => {
      if (!Globals.isTest) { return; }

      var isInit: number = 0;
      var generator: IGenerator;

      Transform(({ }) => {
        if (isInit !== Globals.methodCount) {
          generator = Generator.init(
            type,
            dimension,
            Globals.literals,
            min,
            max
          );
          isInit = Globals.methodCount;
        }
        return generator.next();
      })(target, key);
    };
  };
    
  export const propType = function (_type: string, _dimension: number = 0): PropertyDecorator {
    return (
      _target: Object,
      _key: string | symbol
    ) => {
      // Transform(({ value }) => {
      //   debugger;
      //   console.log(value);
      //   return 1;
      // })(target, key);

      if (!Globals.isTest) { return; }

      // console.log(`
      //   type: ${type},
      //   dimension: ${dimension}
      // `);

      // console.log(`
      //   target: ${target},
      //   key: ${String(key)}
      // `);
    };
  };

  export const arg = function (type: BuiltIn, dimension: number = 0, min?: number, max?: number): ParameterDecorator {
    return (
      target: Object,
      key: string | symbol,
      index: number
    ) => {

      if (!Globals.isTest) { return; }

      ArgsDecorator.addArgument(target, key, {
        index: index,
        type: type,
        dimension: dimension,
        min: min,
        max: max
      });
    };
  };

  export const argType = function (type: string, dimension: number = 0): ParameterDecorator {
    return (
      target: Object,
      key: string | symbol,
      index: number
    ) => {

      if (!Globals.isTest) { return; }
      
      ArgsDecorator.addArgument(target, key, {
        index: index,
        type: type,
        dimension: dimension
      });
    };
  };

  export const method: MethodDecorator =
  (
    target: Object,
    key: string | symbol,
    descriptor: PropertyDescriptor
  ) => {

    if (!Globals.isTest) { return descriptor; }

    // Initialize the method's generators.
    const testArgs: {
      isStart: boolean,
      generators: IGenerator[]
    } = ArgsDecorator.addMethod(target, key);
    
    const originalMethod = descriptor.value;

    // Replace the method with its hook.
    descriptor.value = function (...args: any[]) {
      if (!testArgs.isStart) {
        return originalMethod.apply(this, args);
      }

      // Run the arguments' generators.
      testArgs.generators.forEach((generator: IGenerator) => {
        args[generator.index] = generator.next();
      });

      // Reset the mock flag in case of recursion or subsequent calls.
      testArgs.isStart = false;

      // Run the method.
      return originalMethod.apply(this, args);
    };

    return descriptor;
  };
}
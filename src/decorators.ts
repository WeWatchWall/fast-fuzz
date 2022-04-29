// import { Transform, plainToInstance } from 'class-transformer';

import { BuiltIn, ArgsDecorator } from "./utils/decorators";
import { Globals } from "./utils/globals";

export namespace Fuzz {
  

  export const prop = function (_type: BuiltIn, _dimension: number = 0, _min?: number, _max?: number): PropertyDecorator {
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
      //   dimension: ${dimension},
      //   min: ${min},
      //   max: ${max}
      // `);

      // console.log(`
      //   target: ${target},
      //   key: ${String(key)}
      // `);
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
      generators: any[]
    } = ArgsDecorator.addMethod(target, key);
    
    const originalMethod = descriptor.value;

    // Replace the method with its hook.
    descriptor.value = function (...args: any[]) {
      if (!testArgs.isStart) {
        return originalMethod.apply(this, args);
      }

      // TODO: Run the arguments' generators.
      testArgs.generators.forEach((arg: any) => {
        console.log(JSON.stringify(arg));

      });

      // Reset the mock flag in case of recursion or subsequent calls.
      testArgs.isStart = false;

      // Run the method.
      return originalMethod.apply(this, args);
    };

    return descriptor;
  };
}
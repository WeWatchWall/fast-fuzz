import { Transform } from 'class-transformer';
import { Generator } from './generators/Generator';

import { IGenerator } from "./generators/IGenerator";
import { BuiltIn, Decorators } from "./utils/decorators";
import { Globals } from "./utils/globals";

export namespace Fuzz {

  /**
   * Decorator for properties with built-in types.
   * i.e.: boolean, integer, float, date, string.
   * @param type 
   * @param [dimension] Default = `0`.
   * @param [min] 
   * @param [max] 
   * @returns prop Type = `PropertyDecorator`.
   */
  export const prop = function (
    type: BuiltIn,
    dimension: number = 0,
    min?: number,
    max?: number
  ): PropertyDecorator {

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

  /**
   * Decorator for properties with imported types.
   * @param typeName 
   * @param [dimension] Default = `0`.
   */
  export const propType = function (
    typeName: string,
    dimension: number = 0
  ): PropertyDecorator {

    return (
      target: Object,
      key: string | symbol
    ) => {

      if (!Globals.isTest) { return; }

      const type = Decorators.getPropType(typeName);
      if (type === undefined) {
        console.warn(
          `
            Missing type on decorated property:
            File name: TODO: add this info,
            Class name: ${target.constructor?.name},
            Property name: ${new String(key).toString()},
            Argument: ${JSON.stringify(arg)}
          `
        );
        return;
      }

      var generator: IGenerator =
        Generator.initType(type, dimension);

      Transform(({ }) => {
        return generator.next();
      })(target, key);
    };
  };

  
  /**
   * Decorator for method arguments with built-in types.
   * i.e.: boolean, integer, float, date, string.
   * @param type 
   * @param [dimension] Default = `0`.
   * @param [min] 
   * @param [max] 
   * @returns arg Type = `ParameterDecorator`.
   */
  export const arg = function (
    type: BuiltIn,
    dimension: number = 0,
    min?: number,
    max?: number
  ): ParameterDecorator {

    return (
      target: Object,
      key: string | symbol,
      index: number
    ) => {

      if (!Globals.isTest) { return; }

      Decorators.addArgument(
        target,
        key,
        { index, type, dimension, min, max }
      );
    };
  };

  /**
   * Decorator for method arguments with imported types.
   * @param type 
   * @param [dimension] Default = `0`.
   */
  export const argType = function (
    type: string,
    dimension: number = 0
  ): ParameterDecorator {

    return (
      target: Object,
      key: string | symbol,
      index: number
    ) => {

      if (!Globals.isTest) { return; }
      
      Decorators.addArgument(
        target,
        key,
        {index, type, dimension}
      );
    };
  };

  /**
   * Decorator for methods.
   * @returns method Type = `MethodDecorator`.
   */
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
    } = Decorators.addMethod(target, key);
    
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
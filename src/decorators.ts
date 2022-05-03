import { Transform } from 'class-transformer';
import { GeneratorFactory } from './generators/GeneratorFactory';
import { GeneratorFalsy } from './generators/GeneratorFalsy';

import { IGenerator } from "./generators/IGenerator";
import { Mode } from './generators/Mode';
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

      var methodId: number = 0;
      var methodMode: Mode = Mode.Falsy;
      var generator: IGenerator;

      Transform(({ }) => {
        if (
          methodId !== Globals.methodCount ||
          methodMode !== Globals.mode
        ) {
          generator = GeneratorFactory.init(
            type,
            dimension,
            Globals.literals,
            min,
            max
          );
          methodId = Globals.methodCount;
          methodMode = Globals.mode;
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
        GeneratorFactory.initType(type, dimension);

      Transform(({ }) => {
        return generator.next();
      })(target, key);
    };
  };

  /**
   * Decorator to set properties to falsy values.
   * @returns prop Type = `PropertyDecorator`.
   */
   export const skipProp: PropertyDecorator = (
    target: Object,
    key: string | symbol
  ) => {

    if (!Globals.isTest) { return; }
    
    var generator: IGenerator;

    Transform(({ }) => {
      if (generator === undefined) {
        generator = new GeneratorFalsy();
      }

      return generator.next();
    })(target, key);
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
        { index, type, dimension, min, max, isSkip: false }
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
        {index, type, dimension, isSkip: false}
      );
    };
  };

  /**
   * Decorator for skipping method arguments.
   * @returns arg Type = `ParameterDecorator`.
   */
   export const skipArg: ParameterDecorator = (
    target: Object,
    key: string | symbol,
    index: number
  ) => {
    if (!Globals.isTest) { return; }

    Decorators.addArgument(
      target,
      key,
      { index, dimension: 0, type: '', isSkip: true }
    );
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
        return originalMethod.apply(descriptor, args);
      }

      // Run the arguments' generators.
      testArgs.generators.forEach((generator: IGenerator) => {
        args[generator.index] = generator.next();
      });

      // Reset the mock flag in case of recursion or subsequent calls.
      testArgs.isStart = false;

      // Run the method.
      return originalMethod.apply(descriptor, args);;
    };

    return descriptor;
  };

  /**
   * Decorator for skipping methods in tests.
   * @returns method Type = `MethodDecorator`.
   */
   export const skipMethod: MethodDecorator =
   (
     target: Object,
     key: string | symbol,
     descriptor: PropertyDescriptor
   ) => {
 
     if (!Globals.isTest) { return descriptor; }
 
     // Delete the method from the central repo.
     Decorators.skipMethod(target, key);
 
     return descriptor;
   };
}
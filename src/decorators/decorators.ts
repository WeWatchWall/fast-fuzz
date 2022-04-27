// import { Transform, plainToInstance } from 'class-transformer';

export namespace Fuzz {
  type builtIn = 'boolean' | 'integer' | 'float' | 'date' | 'string';

  export const prop = function (type: builtIn, dimension: number = 0, min?: number, max?: number): PropertyDecorator {
    return (
      target: Object,
      key: string | symbol
    ) => {
      // Transform(({ value }) => {
      //   debugger;
      //   console.log(value);
      //   return 1;
      // })(target, key);

      console.log(`
        type: ${type},
        dimension: ${dimension},
        min: ${min},
        max: ${max}
      `);

      console.log(`
        target: ${target},
        key: ${String(key)}
      `);
    };
  };
    
  export const propType = function (type: string, dimension: number = 0): PropertyDecorator {
    return (
      target: Object,
      key: string | symbol
    ) => {
      // Transform(({ value }) => {
      //   debugger;
      //   console.log(value);
      //   return 1;
      // })(target, key);

      console.log(`
        type: ${type},
        dimension: ${dimension}
      `);

      console.log(`
        target: ${target},
        key: ${String(key)}
      `);
    };
  };

  export const arg = function (type: builtIn, dimension: number = 0, min?: number, max?: number): ParameterDecorator {
    return (
      target: Object,
      key: string | symbol,
      index: number
    ) => {
      console.log(`
        type: ${type},
        dimension: ${dimension},
        min: ${min},
        max: ${max}
      `);

      console.log(`
        target: ${target},
        key: ${String(key)},
        index: ${index}
      `);
    };
  };

  export const argType = function (type: string, dimension: number = 0): ParameterDecorator {
    return (
      target: Object,
      key: string | symbol,
      index: number
    ) => {
      console.log(`
        type: ${type},
        dimension: ${dimension}
      `);

      console.log(`
        target: ${target},
        key: ${String(key)},
        index: ${index}
      `);
    };
  };

  export const method: MethodDecorator =
  (
    target: Object,
    key: string | symbol,
    descriptor: PropertyDescriptor
  ) => {
    const originalMethod = descriptor.value;

    descriptor.value = function (...args) {
      const result = originalMethod.apply(this, args);
      return result;
    };

    console.log(`
      target: ${target},
      key: ${String(key)}
    `);

    return descriptor;
  };
}
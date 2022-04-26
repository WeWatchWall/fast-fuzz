import { Transform, plainToInstance } from 'class-transformer';

export namespace Fuzz { 
  export const prop: PropertyDecorator =
  // (_value: any) =>
  (
    target: Object,
    key: string | symbol
  ) => {
    Transform(({ value }) => { 
      debugger;
      console.log(value);
      return 1;
    })(target, key);
    debugger;
  };
  
  export const arg: ParameterDecorator =
  // (_value: any) =>
  (
    target: Object,
    key: string | symbol,
    _index: number
  ) => {
    debugger;
    console.log(target, key);
  };
  
  export const method: MethodDecorator = 
  // (value: any) =>
  (
    _target: Object,
    _key: string | symbol,
    descriptor: PropertyDescriptor
  ) => {
    const originalMethod = descriptor.value;

    descriptor.value = function (...args) {
      const result = originalMethod.apply(this, args);
      return result;
    };

    debugger;
    return descriptor;
  };
  
  export const p2I = plainToInstance;
}
import makeMatrix from "make-matrix";
import { BuiltIn } from "../utils/decorators";
import { Globals } from "../utils/globals";
import { Limits } from "../utils/limits";
import { ModuleType } from "../utils/modules";
import { IGenerator } from "./IGenerator";
import { Mode } from "./Mode";

export abstract class Generator implements IGenerator {
  /* #region  Properties. */
  static mode: Mode = Mode.Falsy;
  static P_FALSY = 0.85;
  static P_STUFF = 0.7;
  static DEFAULT_FALSY = [undefined, null];

  index: number;
  dimension: number;

  literals?: (number | Date | string)[];
  limits: Limits;

  batchSize: number;
  values: any[];
  count: number;

  protected falsyLiterals: any[];
  /* #endregion */

  /**
   * Creates an instance of generator.
   * @param [dimension] Default = `0`.
   * @param limits 
   * @param [literals] 
   * @param [index] 
   */
  constructor(
    dimension = 0,

    limits: Limits,
    literals?: (number | Date | string)[],
    index?: number
  ) {
    
    this.dimension = Math.max(dimension, 0);
    this.limits = limits;

    this.literals = literals;
    this.falsyLiterals = [undefined, null];

    this.index = index;

    Generator.reset(this);
  }

  abstract next(): any;
  abstract generate(count: number): any[];

  /**
   * Gets the literals by type from an array of strings.
   * @param type 
   * @param literals 
   * @returns literals 
   */
  protected static getLiterals(
    type: BuiltIn,
    literals: string[]
  ): (number | Date | string)[] {
    const byType: {
      integer: number[],
      float: number[],
      date: Date[],
      string: string[],
      boolean: number[]
    } = { integer: [], float: [], date: [], string: [], boolean: [] };

    literals.forEach((literal: string) => {
      const num = Number.parseFloat(literal);
      const int = Number.parseInt(literal);

      if (
        literal === '' ||
        literal === '""' ||
        literal === "''" ||
        literal === 'null' ||
        literal === 'undefined' ||
        literal === 'false' ||
        literal === 'true' ||
        literal === 'NaN'
      ) {
        return;
      } else if (
        num === 0 ||
        num === Number.MIN_VALUE,
        num === -1 * Number.MIN_VALUE
      ) {
        return;
      }

      if (!Number.isNaN(num)) {
        if (!Number.isNaN(int)) { byType.integer.push(int); return; }
        byType.float.push(num);
      } else if (!Number.isNaN(Date.parse(literal))) {
        byType.date.push(new Date(Date.parse(literal)));
      } else {
        byType.string.push(literal.substring(1, literal.length - 1));
      }
    });

    let result: (number | Date | string)[] = byType[type];
    if (type === 'float') {
      result = result.concat(byType.integer);
    }

    return result;
  }

  /**
   * Updates the batch size and generates the generator's values.
   * @param generator
   */
  protected static generate(generator: Generator, count: number): void {
    if (Math.max(count, generator.count) / generator.batchSize > 10) {
      Generator.reset(generator);
      generator.batchSize = Math.max(count, generator.batchSize * 2);
    }

    const newBatch = generator.generate(Math.max(count, generator.batchSize));
    generator.values = newBatch;
    generator.count += newBatch.length;
  }

  
  /**
   * Gets the next generator values based on its state.
   * @param generator 
   */
  protected static next(generator: Generator): {
    count: number,
    result: any
  } {

    if (generator.dimension === 0) {
      if (generator.values.length === 0) {
        Generator.generate(generator, 1);
      }

      return {
        count: 1,
        result: generator.values.pop()
      };
    } else if (generator.dimension === 1) {
      if (Math.random() > Generator.P_FALSY) {
        return {
          count: 0,
          result: Generator.DEFAULT_FALSY[
            Generator.getRandomIndex(Generator.DEFAULT_FALSY.length)
          ]
        };
      }

      const limit = generator.limits.array;
      const count = Generator.getRandomInt(
        limit.min,
        limit.max
      );

      if (count > generator.values.length) {
        Generator.generate(generator, count);
      }

      const result: any[] = [];
      for (let index = 0; index < count; index++) {
        result.push(generator.values.pop());
      }

      return { count, result };
    }  else {
      if (Math.random() > Generator.P_FALSY) {
        return {
          count: 0,
          result: Generator.DEFAULT_FALSY[
            Generator.getRandomIndex(Generator.DEFAULT_FALSY.length)
          ]
        };
      }

      const dLimit = generator.limits.array;
      const dSizes: number[] = [];
      let totalSize = 1;
      for (let index = 0; index < generator.dimension; index++) {
        const dSize = Generator.getRandomInt(
          dLimit.min + 1,
          dLimit.max
        );
        dSizes.push(dSize);
        totalSize *= dSize;
      }

      if (totalSize > generator.values.length) {
        Generator.generate(generator, totalSize);
      }

      let count = 0;
      const result = makeMatrix(dSizes, () => { 
        count++;
        return generator.values.pop();
      });

      return {count, result};
    }
  
  }

  /**
   * Returns a random integer between 0 (inclusive) and max (exclusive).
   * The value is no lower than min (or the next integer greater than min
   * if min isn't an integer) and no greater than max (or the next integer
   * lower than max if max isn't an integer).
   * Using Math.round() will give you a non-uniform distribution!
   */
  static getRandomIndex(max: number) {
    return Math.floor(Math.random() * max);
  }

  /**
    * Returns a random integer between min (inclusive) and max (inclusive).
    * The value is no lower than min (or the next integGer greater than min
    * if min isn't an integer) and no greater than max (or the next integer
    * lower than max if max isn't an integer).
    * Using Math.round() will give you a non-uniform distribution!
    */
  static getRandomInt(min: number, max: number) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  protected static getType(type: ModuleType): any {
    let constructor: any = Globals.codeUtil.modules[type.file];
    type.namespaces.forEach((namespace: string) => {
      constructor = constructor[namespace];
    });

    constructor = constructor[type.name];
    return constructor;
  }

  /**
   * Resets generator state to the initial one.
   * @param generator 
   */
  private static reset(generator: Generator): void {
    generator.batchSize = 100;
    generator.values = [];
    generator.count = 0;
  }
}
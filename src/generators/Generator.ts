import makeMatrix from "make-matrix";
import { BuiltIn } from "../utils/decorators";
import { Limits } from "../utils/limits";
import { IGenerator } from "./IGenerator";
import { Mode } from "./Mode";

export abstract class Generator implements IGenerator {
  /* #region  Public properties. */
  static mode: Mode = Mode.Falsy;
  static P_STUFF_FALSY: number = 0.8;

  index: number;
  dimension: number;

  literals?: (number | Date | string)[];
  limits: Limits;

  batchSize: number;
  values: any[];
  count: number;
  /* #endregion */

  protected falsyLiterals: any[];

  /**
   * Creates an instance of generator.
   * @param index 
   * @param [dimension] Default = `0`.
   * @param limits 
   * @param [literals] 
   */
  constructor(
    index: number,
    dimension: number = 0,

    limits: Limits,
    literals?: (number | Date | string)[]
  ) {
    this.index = index;
    this.dimension = Math.max(dimension, 0);

    this.limits = limits;
    this.literals = literals;

    this.falsyLiterals = [undefined, null];

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

      if (!Number.isNaN(num)) {
        if (!Number.isNaN(int)) { byType.integer.push(int); return; }
        byType.float.push(num);
      } else if (!Number.isNaN(Date.parse(literal))) {
        byType.date.push(new Date(Date.parse(literal)));
      } else {
        byType.string.push(literal);
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
    const originalBatchSize = generator.batchSize;
    if (Math.max(count, generator.count) / originalBatchSize > 10) {
      Generator.reset(generator);
      generator.batchSize = Math.max(count, originalBatchSize * 10);
    }

    const newBatch = generator.generate(Math.max(count, generator.batchSize));
    generator.values = newBatch;
    generator.count += newBatch.length;
  }

  
  /**
   * Gets the next generator values based on its state.
   * @param generator 
   */
  protected static next(generator: Generator): any {

    switch (generator.dimension) {
      case 0:
        if (generator.values.length === 0) {
          Generator.generate(generator, 1);
        }

        return generator.values.pop();
      case 1:
        const limit = generator.limits.array;
        const size = Generator.getRandomInt(
          limit.min,
          limit.max
        );

        if (size > generator.values.length) {
          Generator.generate(generator, size);
        }

        const result: any[] = [];
        for (let index = 0; index < size; index++) {
          result.push(generator.values.pop());
        }
        return result;
      default:
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

        // @ts-ignore — `Type instantiation is excessively deep...`
        return makeMatrix(dSizes, () => generator.values.pop());
    }
  }

  /**
   * Returns a random integer between 0 (inclusive) and max (exclusive).
   * The value is no lower than min (or the next integer greater than min
   * if min isn't an integer) and no greater than max (or the next integer
   * lower than max if max isn't an integer).
   * Using Math.round() will give you a non-uniform distribution!
   */
  protected static getRandomIndex(max: number) {
    return Math.floor(Math.random() * max);
  }

  /**
    * Returns a random integer between min (inclusive) and max (inclusive).
    * The value is no lower than min (or the next integGer greater than min
    * if min isn't an integer) and no greater than max (or the next integer
    * lower than max if max isn't an integer).
    * Using Math.round() will give you a non-uniform distribution!
    */
  protected static getRandomInt(min: number, max: number) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
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
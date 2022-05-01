import { Limits } from "../utils/limits";
import { Generator } from "./Generator";
import { Mode } from "./Mode";

export class GeneratorFloat extends Generator {
  constructor(index: number, dimension: number = 0, literals: string[], min?: number, max?: number) {
    super(
      index,
      dimension,
      new Limits({ float: { min, max } }),
      Generator.getLiterals('float', literals)
    );
    this.falsyLiterals = this.falsyLiterals.concat([0, -0, Number.MIN_VALUE, -1 * Number.MIN_VALUE, NaN]);
    this.literals = this.literals.concat(this.falsyLiterals);
  }

  generate(count: number): number[] {
    let result: any[] = [];

    switch (Generator.mode) {
      case Mode.Falsy:
        for (let index = 0; index < count; index++) {
          result.push(this.falsyLiterals[Generator.getRandomIndex(this.falsyLiterals.length)]);
        }
        break;
      case Mode.Stuff:
        for (let index = 0; index < count; index++) {
          result.push(this.literals[Generator.getRandomIndex(this.literals.length)]);
        }
        break;
      default:
        const min = this.limits.float.min;
        const max = this.limits.float.max;
        for (let index = 0; index < count; index++) {
          if (Math.random() > Generator.P_STUFF_FALSY) { 
            result.push(this.literals[Generator.getRandomIndex(this.literals.length)]);
            continue;
          }

          result.push(GeneratorFloat.getRandomFloat(min, max));
        }
        break;
    }

    return result;
  }

  next(): any {
    return Generator.next(this);
  }

  /**
   * Returns a random number between min (inclusive) and max (exclusive)
   */
  static getRandomFloat(min: number, max: number) {
    return Math.random() * (max - min) + min;
  }
}
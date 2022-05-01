import { Limits } from "../utils/limits";
import { Generator } from "./Generator";
import { Mode } from "./Mode";

export class GeneratorInt extends Generator {
  constructor(index: number, dimension: number = 0, literals: string[], min?: number, max?: number) {
    super(
      index,
      dimension,
      new Limits({ int: { min, max } }),
      Generator.getLiterals('integer', literals)
    );
    this.falsyLiterals = this.falsyLiterals.concat([0, -0, NaN]);
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
        const min = this.limits.int.min;
        const max = this.limits.int.max;
        for (let index = 0; index < count; index++) {
          if (Math.random() > Generator.P_STUFF_FALSY) { 
            result.push(this.literals[Generator.getRandomIndex(this.literals.length)]);
            continue;
          }

          result.push(Generator.getRandomInt(min, max));
        }
        break;
    }

    return result;
  }

  next(): any {
    return Generator.next(this);
  }
}
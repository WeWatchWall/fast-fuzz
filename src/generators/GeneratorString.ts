import { Limits } from "../utils/limits";
import { Generator } from "./Generator";
import { Mode } from "./Mode";

/**
 * Generator for strings. Just for stuffind or placeholders.
 * Not usually used in logic because of their combinatorial explosion.
 */
export class GeneratorString extends Generator {
  constructor(dimension: number = 0, literals: string[], min?: number, max?: number, index?: number) {
    super(
      dimension,
      new Limits({ string: { min, max } }),
      Generator.getLiterals('string', literals),
      index
    );
    this.falsyLiterals = this.falsyLiterals.concat(['']);
    this.literals = this.literals.concat(this.falsyLiterals);
  }

  generate(count: number): string[] {
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
        const min = this.limits.date.min;
        const max = this.limits.date.max;
        for (let index = 0; index < count; index++) {
          if (Math.random() > Generator.P_STUFF_FALSY) { 
            result.push(this.literals[Generator.getRandomIndex(this.literals.length)]);
            continue;
          }
          
          result.push(
            `${Math.random().toString(36)}00000000000000000`
              .slice(
                2,
                Generator.getRandomInt(min, max) + 2
              )
          );
        }
        break;
    }

    return result;
  }

  next(): any {
    return Generator.next(this);
  }
}
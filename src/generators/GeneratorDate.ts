import { Limits } from "../utils/limits";
import { Generator } from "./Generator";
import { Mode } from "./Mode";

export class GeneratorDate extends Generator {
  constructor(index: number, dimension: number = 0, literals: string[], min?: number, max?: number) {
    super(
      index,
      dimension,
      new Limits({ date: { min, max } }),
      Generator.getLiterals('date', literals)
    );
    this.falsyLiterals = this.falsyLiterals.concat([new Date(0), new Date(Date.parse('0'))]);
    this.literals = this.literals.concat(this.falsyLiterals);
  }

  generate(count: number): Date[] {
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

          result.push(new Date(Generator.getRandomInt(min, max)));
        }
        break;
    }

    return result;
  }

  next() {
    throw new Error("Method not implemented.");
  }
}
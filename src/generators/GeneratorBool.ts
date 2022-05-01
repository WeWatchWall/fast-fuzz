import { Limits } from "../utils/limits";
import { Generator } from "./Generator";
import { Mode } from "./Mode";

export class GeneratorBool extends Generator {
  constructor(index: number, dimension: number = 0) {
    super(index, dimension, new Limits({}), []);
    this.falsyLiterals = this.falsyLiterals.concat([false]);
    this.literals = this.literals.concat(this.falsyLiterals);
  }

  generate(count: number): boolean[] {
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
        for (let index = 0; index < count; index++) {
          if (Math.random() > Generator.P_STUFF_FALSY) { 
            result.push(this.literals[Generator.getRandomIndex(this.literals.length)]);
            continue;
          }

          result.push(!!Generator.getRandomIndex(2));
        }
        break;
    }

    return result;
  }

  next() {
    throw new Error("Method not implemented.");
  }

}
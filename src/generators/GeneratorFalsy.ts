import { Limits } from "../utils/limits";
import { Generator } from "./Generator";
import { Mode } from "./Mode";

export class GeneratorFalsy extends Generator {
  constructor(dimension: number = 0, index?: number) {
    super(dimension, new Limits({}), [], index);
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
      default:
        for (let index = 0; index < count; index++) {
          result.push(this.literals[Generator.getRandomIndex(this.literals.length)]);
        }
        break;
    }

    return result;
  }

  next(): any {
    return Generator.next(this);
  }

}
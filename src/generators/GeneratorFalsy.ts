import { Limits } from "../utils/limits";
import { Generator } from "./Generator";

export class GeneratorFalsy extends Generator {
  constructor(dimension = 0, index?: number) {
    super(dimension, new Limits({}), [], index);
  }

  generate(count: number): boolean[] {
    const result: any[] = [];

    for (let index = 0; index < count; index++) {
      result.push(this.falsyLiterals[Generator.getRandomIndex(this.falsyLiterals.length)]);
    }

    return result;
  }

  next(): any {
    return Generator.next(this).result;
  }

}
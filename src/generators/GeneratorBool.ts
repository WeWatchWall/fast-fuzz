import { Limits } from "../utils/limits";
import { Generator } from "./Generator";
import { Mode } from "./Mode";

export class GeneratorBool extends Generator {
  constructor(dimension = 0, index?: number) {
    super(dimension, new Limits({}), [], index);
    this.falsyLiterals = this.falsyLiterals.concat([false]);
  }

  generate(count: number): boolean[] {
    const result: any[] = [];

    switch (Generator.mode) {
      case Mode.Falsy:
        for (let index = 0; index < count; index++) {
          result.push(
            this.falsyLiterals[
              Generator.getRandomIndex(this.falsyLiterals.length)
            ]
          );
        }
        break;
      case Mode.Stuff:
      default:
        for (let index = 0; index < count; index++) {
          if (Math.random() > Generator.P_FALSY) { 
            result.push(
              this.falsyLiterals[
                Generator.getRandomIndex(this.falsyLiterals.length)
              ]
            );
            continue;
          }

          result.push(!!Generator.getRandomIndex(2));
        }
        break;
    }

    return result;
  }

  next(): any {
    return Generator.next(this).result;
  }

}
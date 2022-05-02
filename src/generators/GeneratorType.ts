import { Limits } from "../utils/limits";
import { ModuleType } from "../utils/modules";
import { Generator } from "./Generator";
import { Mode } from "./Mode";

export class GeneratorType extends Generator {
  constructor(_type: ModuleType, dimension: number = 0, index?: number) {
    super(dimension, new Limits({}), [], index);
    this.falsyLiterals = this.falsyLiterals.concat([{}]);
  }

  generate(count: number): any[] {
    let result: any[] = [];

    switch (Generator.mode) {
      case Mode.Falsy:
        for (let index = 0; index < count; index++) {
          result.push(this.falsyLiterals[Generator.getRandomIndex(this.falsyLiterals.length)]);
        }
        break;
      default:
        
        break;
    }

    return result;
  }

  next(): any {
    return Generator.next(this);
  }
}
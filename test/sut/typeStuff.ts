import {
  fuzzArgType,
  fuzzMethod
} from "../../src/fast-fuzz";
import { IInstance } from "./typeInstance";

export class Stuff_Simple {

  @fuzzMethod
  public static stuff_instance(
    @fuzzArgType('IInstance')
    argInstance: IInstance
  ): string {
    if (argInstance === undefined) {
      return `Undefined: ${argInstance}`;
    } else if (argInstance === null) {
      return `Null: ${argInstance}`;
    } else if (Object.values(argInstance).length === 0) {
      return `Empty object {}: ${JSON.stringify(argInstance)}`;
    }

    const arg = argInstance.getValue();

    switch (arg[1]) {
      case 22:
        return `Branch 1: ${JSON.stringify(arg)}`;
      case 17:
        return `Branch 2: ${JSON.stringify(arg)}`;
      default:
        break;
    }
    return `Branch 0: ${JSON.stringify(arg)}`;
  }
}
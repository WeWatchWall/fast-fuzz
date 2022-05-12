import { Fuzz } from "../../src";
import { Reference_Derived } from "./typeReference";

export class Type_Single {

  @Fuzz.method
  public static type_single_simple(
    @Fuzz.argType(Reference_Derived.name)
    argInstance: Reference_Derived
  ): string {
    if (argInstance === undefined) {
      return `Undefined: ${argInstance}`;
    } else if (argInstance === null) {
      return `Null: ${argInstance}`;
    } else if (Object.values(argInstance).length === 0) {
      return `Empty object {}: ${JSON.stringify(argInstance)}`;
    }

    const arg = argInstance.getValue();
    if (arg[3] !== Reference_Derived.name) {
      return `Wrong type: ${arg[3]}`;
    }

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

  public static type_single_simple_naked(
    argInstance: Reference_Derived
  ): string {
    if (argInstance === undefined) {
      return `Undefined: ${argInstance}`;
    } else if (argInstance === null) {
      return `Null: ${argInstance}`;
    } else if (Object.values(argInstance).length === 0) {
      return `Empty object {}: ${JSON.stringify(argInstance)}`;
    }

    const arg = argInstance.getValue();
    if (arg[3] !== Reference_Derived.name) {
      return `Wrong type: ${arg[3]}`;
    }

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

  @Fuzz.method
  public static type_single_array(
    @Fuzz.argType(Reference_Derived.name, 1)
    argArray: Reference_Derived[]
  ): string {
    if (argArray === undefined) {
      return `Undefined []: ${JSON.stringify(argArray)}`;
    } else if (argArray === null) {
      return `Null []: ${JSON.stringify(argArray)}`;
    } else if (argArray.length === 0) {
      return `Empty []: ${JSON.stringify(argArray)}`;
    }
    
    const argInstance = argArray[0];

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

  @Fuzz.method
  public static type_single_regular(
    @Fuzz.argType(Reference_Derived.name)
    argInstance: Reference_Derived
  ): string {
    if (argInstance === undefined) {
      return `Undefined: ${argInstance}`;
    } else if (argInstance === null) {
      return `Null: ${argInstance}`;
    }

    const arg = argInstance.getValue();

    if (arg[2] == 7) {
      if (arg[0] == 'Bob') {
        return `Branch 1: ${JSON.stringify(arg)}`;
      }
    } else if (arg[2] == 10) {
      if (arg[1] == 22 && arg[0] == 'Alice') {
        return `Branch 2: ${JSON.stringify(arg)}`;
      }
    }
    return `Branch 0: ${JSON.stringify(arg)}`;
  }
}
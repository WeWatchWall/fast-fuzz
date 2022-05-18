import { Fuzz } from "../../src/fast-fuzz";
import {
  IReference,
  Reference_Abstract,
  Reference_Base
} from "./typeReference";

export class Type_Inherit {

  @Fuzz.method
  public static type_inherit_simple(
    @Fuzz.argType(Reference_Base.name)
    argInstance: Reference_Base
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

  @Fuzz.method
  public static type_inherit_abstract(
    @Fuzz.argType(Reference_Abstract.name)
    argInstance: Reference_Abstract
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

  @Fuzz.method
  public static type_inherit_interface(
    @Fuzz.argType('IReference')
    argInstance: IReference
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
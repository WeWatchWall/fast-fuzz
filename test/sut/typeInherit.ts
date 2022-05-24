import {
  fuzzArgType,
  fuzzMethod
} from "../../src/fast-fuzz";
import { IInstance } from "./typeInstance";

import {
  IReference,
  Reference_Abstract,
  Reference_Base
} from "./typeReference";

export class Type_Inherit {

  @fuzzMethod
  public static type_inherit_simple(
    @fuzzArgType(Reference_Base.name)
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

  @fuzzMethod
  public static type_inherit_abstract(
    @fuzzArgType(Reference_Abstract.name)
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

  @fuzzMethod
  public static type_inherit_interface(
    @fuzzArgType('IReference')
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

  @fuzzMethod
  public static type_instance(
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
import { Mode } from "../generators/Mode";
import { Code } from "./code";

/**
 * Globals to communicate accross the test environment.
 */
export namespace Globals {
  export var isTest = false;
  export var codeUtil: Code;

  export var literals: string[] = [];
  export var methodCount = 0;
  export var mode: Mode = Mode.Falsy;
}
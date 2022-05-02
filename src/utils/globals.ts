import { Mode } from "../generators/Mode";
import { Code } from "./code";

/**
 * Globals to communicate accross the test environment.
 */
export namespace Globals {
  export var isTest: boolean = false;
  export var codeUtil: Code;

  export var literals: string[] = [];
  export var methodCount: number = 0;
  export var mode: Mode = Mode.Falsy;
}